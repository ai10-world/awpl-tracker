// app/api/reports/my-teams/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient();
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ teams: [] });

  const { data } = await adminSupabase
    .from("team_members")
    .select(`team_id, team:teams(id, name)`)
    .eq("profile_id", user.id);

  const teams = data?.map((d: any) => ({
    team_id: d.team_id,
    team_name: d.team?.name,
  })) || [];

  return NextResponse.json({ teams });
}
