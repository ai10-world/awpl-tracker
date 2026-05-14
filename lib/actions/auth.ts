"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Admin client bypasses rate limits
function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function signUp(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const awplId = formData.get("awpl_id") as string;
  const password = formData.get("password") as string;
  const pin = formData.get("pin") as string;

  if (!/^\d{4,6}$/.test(pin)) {
    return { error: "PIN must be 4 to 6 digits." };
  }

  // Use admin client to bypass email rate limit
  const adminSupabase = getAdminClient();

  const { data: authData, error: authError } =
    await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto confirm email
      user_metadata: { full_name: name, awpl_id: awplId },
    });

  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "Could not create account. Please try again." };

  const { error: profileError } = await adminSupabase.from("profiles").insert({
    id: authData.user.id,
    full_name: name,
    email,
    awpl_id: awplId,
    pin_hash: pin,
    role: "member",
  });

  if (profileError) return { error: profileError.message };

  // Now sign in the user normally
  const supabase = createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) return { error: signInError.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logIn(formData: FormData) {
  const supabase = createClient();

  const awplId = formData.get("awpl_id") as string;
  const password = formData.get("password") as string;
  const pin = formData.get("pin") as string;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("email, pin_hash")
    .eq("awpl_id", awplId)
    .single();

  if (profileError || !profile) return { error: "No account found with this AWPL ID." };
  if (profile.pin_hash !== pin) return { error: "Incorrect PIN." };

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password,
  });

  if (signInError) return { error: signInError.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}