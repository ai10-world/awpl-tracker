// app/page.tsx
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import LandingPage from "@/components/landing/landing-page";
import WelcomeBackPage from "@/components/landing/welcome-back";

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function RootPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const adminSupabase = getAdminClient();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("full_name, awpl_id, role")
      .eq("id", user.id)
      .single();

    return <WelcomeBackPage profile={profile} />;
  }

  return <LandingPage />;
}
