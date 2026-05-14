"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = createClient();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const awplId = formData.get("awpl_id") as string;
  const password = formData.get("password") as string;
  const pin = formData.get("pin") as string;

  if (!/^\d{4,6}$/.test(pin)) {
    return { error: "PIN must be 4 to 6 digits." };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, awpl_id: awplId },
    },
  });

  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "Could not create account. Please try again." };

  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,  // id = auth.users.id (Supabase standard)
    full_name: name,
    email,
    awpl_id: awplId,
    pin_hash: pin,
    role: "member",
  });

  if (profileError) return { error: profileError.message };

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