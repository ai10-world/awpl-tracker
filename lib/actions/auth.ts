// lib/actions/auth.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ─── Sign Up ──────────────────────────────────────────────────────────────────
export async function signUp(formData: FormData) {
  const supabase = createClient();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const awplId = formData.get("awpl_id") as string;
  const password = formData.get("password") as string;
  const pin = formData.get("pin") as string;

  // Validate PIN (4–6 digits)
  if (!/^\d{4,6}$/.test(pin)) {
    return { error: "PIN must be 4 to 6 digits." };
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        awpl_id: awplId,
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Could not create account. Please try again." };
  }

  // Check if a profile with this AWPL ID already exists (account reconnect logic)
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("awpl_id", awplId)
    .single();

  if (existingProfile) {
    // Reconnect: update existing profile with new auth user id
    await supabase
      .from("profiles")
      .update({
        auth_user_id: authData.user.id,
        email,
        full_name: name,
        pin_hash: pin, // In production: hash this with bcrypt
        updated_at: new Date().toISOString(),
      })
      .eq("awpl_id", awplId);
  } else {
    // New profile
    const { error: profileError } = await supabase.from("profiles").insert({
      auth_user_id: authData.user.id,
      full_name: name,
      email,
      awpl_id: awplId,
      pin_hash: pin, // In production: hash this with bcrypt
      role: "member",
    });

    if (profileError) {
      return { error: profileError.message };
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ─── Log In ───────────────────────────────────────────────────────────────────
export async function logIn(formData: FormData) {
  const supabase = createClient();

  const awplId = formData.get("awpl_id") as string;
  const password = formData.get("password") as string;
  const pin = formData.get("pin") as string;

  // Look up email by AWPL ID
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("email, pin_hash")
    .eq("awpl_id", awplId)
    .single();

  if (profileError || !profile) {
    return { error: "No account found with this AWPL ID." };
  }

  // Verify PIN
  if (profile.pin_hash !== pin) {
    // In production: use bcrypt.compare(pin, profile.pin_hash)
    return { error: "Incorrect PIN." };
  }

  // Sign in with email + password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password,
  });

  if (signInError) {
    return { error: signInError.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ─── Log Out ──────────────────────────────────────────────────────────────────
export async function logOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
