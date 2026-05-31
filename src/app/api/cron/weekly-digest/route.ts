import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { composeDigest } from "@/lib/digest";
import { sendEmail } from "@/lib/integrations/email";
import type { Cohort, Incident, RiskItem } from "@/lib/types";

export const dynamic = "force-dynamic";

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const header = req.headers.get("authorization");
  const qs = req.nextUrl.searchParams.get("secret");
  return header === `Bearer ${secret}` || qs === secret;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const admin = createSupabaseAdmin();
  const [{ data: cohorts }, { data: incidents }, { data: risks }] = await Promise.all([
    admin.from("cohorts").select("*"),
    admin.from("incidents").select("*"),
    admin.from("risk_register").select("*"),
  ]);
  const { subject, body } = composeDigest({
    cohorts: (cohorts ?? []) as Cohort[],
    incidents: (incidents ?? []) as Incident[],
    risks: (risks ?? []) as RiskItem[],
  });
  const email = await sendEmail({ to: process.env.DIGEST_TO, subject, text: body });
  return NextResponse.json({ ok: true, subject, email });
}
