"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function verifyVaultPin(pin: string) {
  const cleanPin = (pin || "").trim();
  if (!/^\d{4,6}$/.test(cleanPin)) {
    return { ok: false, error: "PIN must be 4 to 6 digits." };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Session expired. Please log in again." };
  }

  const adminSupabase = getAdminClient();
  const { data: profile, error } = await adminSupabase
    .from("profiles")
    .select("pin_hash")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return { ok: false, error: "Could not verify PIN." };
  }

  if (profile.pin_hash !== cleanPin) {
    return { ok: false, error: "Incorrect PIN." };
  }

  return { ok: true };
}
