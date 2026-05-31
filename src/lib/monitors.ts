import "server-only";
import { createSupabaseAdmin } from "./supabase/admin";
import type { Cohort, Monitor, RoundMetric } from "./types";

export interface MonitorFinding {
  monitorId: string;
  severity: "P0" | "P1" | "P2";
  title: string;
  detail: string;
  cohortCode: string | null;
}

// Evaluate every enabled monitor against current data. Pure read → findings.
export function evaluateMonitors(
  monitors: Monitor[],
  cohorts: Cohort[],
  metrics: RoundMetric[]
): MonitorFinding[] {
  const findings: MonitorFinding[] = [];

  for (const mon of monitors.filter((m) => m.enabled)) {
    switch (mon.rule_key) {
      case "email_delivery":
        for (const c of cohorts) {
          if (c.email_delivery_pct < 100 && c.onboarding_status !== "Manually Remedied") {
            findings.push({
              monitorId: mon.id,
              severity: "P1",
              title: `${c.code}: welcome-email delivery at ${c.email_delivery_pct}%`,
              detail: `${c.facilitator}'s cohort had a silent onboarding failure. ${c.transfer_requests} transfer requests downstream.`,
              cohortCode: c.code,
            });
          }
        }
        break;

      case "pulse_drop":
        for (const c of cohorts) {
          const drops = [
            c.pulse.w1 - c.pulse.w2,
            c.pulse.w2 - c.pulse.w3,
            c.pulse.w4 != null ? c.pulse.w3 - c.pulse.w4 : 0,
          ];
          const worst = Math.max(...drops);
          if (worst > 1.0) {
            findings.push({
              monitorId: mon.id,
              severity: "P0",
              title: `${c.code}: pulse dropped ${worst.toFixed(1)} week-on-week`,
              detail: `${c.facilitator}'s cohort fell from ${c.pulse.w1} to ${c.pulse.w3}. Would have flagged in week 2 — not week 4.`,
              cohortCode: c.code,
            });
          }
        }
        break;

      case "invoice_variance": {
        const r4 = metrics.find((m) => m.round_id === 4);
        const baseline = metrics.find((m) => m.round_id === 3);
        if (r4 && baseline && r4.vendor_cost > baseline.vendor_cost * 2) {
          findings.push({
            monitorId: mon.id,
            severity: "P2",
            title: `Vendor spend ${(r4.vendor_cost / baseline.vendor_cost).toFixed(1)}x trailing baseline`,
            detail: `Vendor cost jumped to $${r4.vendor_cost.toLocaleString()} vs $${baseline.vendor_cost.toLocaleString()}. Auto-hold recommended before payment.`,
            cohortCode: null,
          });
        }
        break;
      }

      case "cover_gap":
        for (const c of cohorts) {
          if (c.risk === "Amber" && c.headline.toLowerCase().includes("cover")) {
            findings.push({
              monitorId: mon.id,
              severity: "P1",
              title: `${c.code}: no facilitator for next session`,
              detail: `${c.facilitator} is unavailable. ${c.schedule} needs cover.`,
              cohortCode: c.code,
            });
          }
        }
        break;

      case "admissions_sla":
        findings.push({
          monitorId: mon.id,
          severity: "P1",
          title: "Admissions decision approaching candidate deadline",
          detail: "A competing-offer candidate must decide tomorrow. Two reviews still pending course-owner sign-off.",
          cohortCode: null,
        });
        break;
    }
  }
  return findings;
}

// Run all monitors, stamp last_run, and create alerts for new findings.
// Returns the alerts created this run.
export async function runMonitors() {
  const admin = createSupabaseAdmin();
  const [{ data: monitors }, { data: cohorts }, { data: metrics }] = await Promise.all([
    admin.from("monitors").select("*"),
    admin.from("cohorts").select("*"),
    admin.from("round_metrics").select("*"),
  ]);

  const findings = evaluateMonitors(
    (monitors ?? []) as Monitor[],
    (cohorts ?? []) as Cohort[],
    (metrics ?? []) as RoundMetric[]
  );

  // De-dupe against unacknowledged alerts with the same title.
  const { data: openAlerts } = await admin
    .from("alerts")
    .select("title")
    .eq("acknowledged", false);
  const existing = new Set((openAlerts ?? []).map((a) => a.title));

  const fresh = findings.filter((f) => !existing.has(f.title));
  if (fresh.length > 0) {
    await admin.from("alerts").insert(
      fresh.map((f) => ({
        monitor_id: f.monitorId,
        severity: f.severity,
        title: f.title,
        detail: f.detail,
        cohort_code: f.cohortCode,
      }))
    );
  }

  await admin
    .from("monitors")
    .update({ last_run: new Date().toISOString(), last_status: `${findings.length} findings` })
    .neq("id", "");

  return { findingsCount: findings.length, created: fresh.length, fresh };
}
