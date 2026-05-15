// app/api/reports/today/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ report: null });

  const teamId = req.nextUrl.searchParams.get("team_id");
  if (!teamId) return NextResponse.json({ report: null });

  const today = new Date().toISOString().split("T")[0];

  const { data } = await adminSupabase
    .from("reports")
    .select("*")
    .eq("profile_id", user.id)
    .eq("team_id", teamId)
    .eq("report_date", today)
    .single();

  return NextResponse.json({ report: data || null });
}
