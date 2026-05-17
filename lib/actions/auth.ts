"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ─── Sign Up (with PIN stored, password only for Supabase auth) ───────────────
export async function signUp(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const awplId = (formData.get("awpl_id") as string)?.trim().toUpperCase();
  const password = formData.get("password") as string;
  const pin = formData.get("pin") as string;

  if (!name || !email || !awplId || !password || !pin) {
    return { error: "All fields are required." };
  }
  if (!/^\d{4,6}$/.test(pin)) {
    return { error: "PIN must be 4 to 6 digits." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const adminSupabase = getAdminClient();

  // Check duplicate AWPL ID
  const { data: existing } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("awpl_id", awplId)
    .single();
  if (existing) {
    return { error: "An account with this AWPL ID already exists. Please sign in." };
  }

  // Check duplicate email
  const { data: existingEmail } = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();
  if (existingEmail) {
    return { error: "An account with this email already exists. Please sign in." };
  }

  // Create auth user (bypass email rate limit)
  const { data: authData, error: authError } =
    await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, awpl_id: awplId },
    });

  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "Could not create account. Please try again." };

  // Create profile
  const { error: profileError } = await adminSupabase.from("profiles").insert({
    id: authData.user.id,
    full_name: name,
    email,
    awpl_id: awplId,
    pin_hash: pin,
    role: "member",
  });

  if (profileError) {
    // Rollback auth user
    await adminSupabase.auth.admin.deleteUser(authData.user.id);
    return { error: profileError.message };
  }

  // Sign in immediately
  const supabase = createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) return { error: signInError.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ─── PIN Only Login ────────────────────────────────────────────────────────────
// Daily login: AWPL ID + PIN only (no password needed)
export async function pinLogin(formData: FormData) {
  const awplId = (formData.get("awpl_id") as string)?.trim().toUpperCase();
  const pin = formData.get("pin") as string;

  if (!awplId || !pin) return { error: "AWPL ID and PIN are required." };

  const adminSupabase = getAdminClient();

  // Look up profile
  const { data: profile, error: profileError } = await adminSupabase
    .from("profiles")
    .select("id, email, pin_hash, is_active, full_name")
    .eq("awpl_id", awplId)
    .single();

  if (profileError || !profile) {
    return { error: "No account found with this AWPL ID." };
  }

  if (!profile.is_active) {
    return { error: "Your account has been deactivated. Contact your admin." };
  }

  // Verify PIN
  if (profile.pin_hash !== pin) {
    return { error: "Incorrect PIN. Please try again." };
  }

  // Sign in using admin (no password needed from user side)
  const { data: sessionData, error: sessionError } =
    await adminSupabase.auth.admin.generateLink({
      type: "magiclink",
      email: profile.email,
    });

  if (sessionError || !sessionData) {
    return { error: "Could not create session. Please try again." };
  }

  // Exchange magic link token for session
  const supabase = createClient();
  const token = sessionData.properties?.hashed_token;

  if (!token) {
    return { error: "Could not generate session token." };
  }

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: "magiclink",
  });

  if (verifyError) {
    return { error: "Session error. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ─── Full Login (AWPL ID + Password + PIN) — for first login or recovery ───────
export async function logIn(formData: FormData) {
  const awplId = (formData.get("awpl_id") as string)?.trim().toUpperCase();
  const password = formData.get("password") as string;
  const pin = formData.get("pin") as string;

  if (!awplId || !password || !pin) {
    return { error: "All fields are required." };
  }

  const adminSupabase = getAdminClient();

  const { data: profile, error: profileError } = await adminSupabase
    .from("profiles")
    .select("email, pin_hash, is_active")
    .eq("awpl_id", awplId)
    .single();

  if (profileError || !profile) {
    return { error: "No account found with this AWPL ID." };
  }

  if (!profile.is_active) {
    return { error: "Your account has been deactivated. Contact your admin." };
  }

  if (profile.pin_hash !== pin) {
    return { error: "Incorrect PIN. Please try again." };
  }

  const supabase = createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password,
  });

  if (signInError) {
    return { error: "Incorrect password. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ─── Forgot Password ───────────────────────────────────────────────────────────
export async function forgotPassword(formData: FormData) {
  const awplId = (formData.get("awpl_id") as string)?.trim().toUpperCase();

  if (!awplId) return { error: "Please enter your AWPL ID." };

  const adminSupabase = getAdminClient();

  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("email, full_name")
    .eq("awpl_id", awplId)
    .single();

  if (!profile) {
    return { error: "No account found with this AWPL ID." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-pin`,
  });

  if (error) return { error: error.message };

  return { success: `Password reset link sent to ${profile.email}` };
}

// ─── Reset PIN ─────────────────────────────────────────────────────────────────
export async function resetPin(formData: FormData) {
  const awplId = (formData.get("awpl_id") as string)?.trim().toUpperCase();
  const password = formData.get("password") as string;
  const newPin = formData.get("new_pin") as string;
  const confirmPin = formData.get("confirm_pin") as string;

  if (!awplId || !password || !newPin || !confirmPin) {
    return { error: "All fields are required." };
  }
  if (!/^\d{4,6}$/.test(newPin)) {
    return { error: "PIN must be 4 to 6 digits." };
  }
  if (newPin !== confirmPin) {
    return { error: "PINs do not match." };
  }

  const adminSupabase = getAdminClient();

  // Look up profile
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("id, email")
    .eq("awpl_id", awplId)
    .single();

  if (!profile) return { error: "No account found with this AWPL ID." };

  // Verify password first
  const supabase = createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password,
  });

  if (signInError) return { error: "Incorrect password." };

  // Update PIN
  const { error: updateError } = await adminSupabase
    .from("profiles")
    .update({ pin_hash: newPin })
    .eq("id", profile.id);

  if (updateError) return { error: updateError.message };

  return { success: "PIN reset successfully! You can now log in with your new PIN." };
}

// ─── Log Out ───────────────────────────────────────────────────────────────────
export async function logOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
