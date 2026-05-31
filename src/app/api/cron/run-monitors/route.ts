import { NextResponse, type NextRequest } from "next/server";
import { runMonitors } from "@/lib/monitors";
import { sendSlack } from "@/lib/integrations/slack";

export const dynamic = "force-dynamic";

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // allow if unset (dev)
  const header = req.headers.get("authorization");
  const qs = req.nextUrl.searchParams.get("secret");
  return header === `Bearer ${secret}` || qs === secret;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await runMonitors();
  if (result.created > 0) {
    await sendSlack(`:satellite_antenna: Scheduled monitor run flagged ${result.created} new alert(s).`, "OpsPulse · cron");
  }
  return NextResponse.json({ ok: true, ...result, fresh: undefined });
}
