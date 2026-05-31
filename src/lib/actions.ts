"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "./supabase/admin";
import { getSessionProfile } from "./session";
import { logAction } from "./audit";
import { sendSlack } from "./integrations/slack";
import { sendEmail } from "./integrations/email";
import { buildSessionInvite } from "./integrations/calendar";
import { runMonitors } from "./monitors";
import { composeDigest } from "./digest";
import type { BackupFacilitator, Cohort, Incident, RiskItem } from "./types";

async function actor() {
  const p = await getSessionProfile();
  return { name: p?.full_name || "Unknown", role: p?.role || "ops" };
}

function revalidateAll() {
  ["/", "/queue", "/triage", "/backup", "/finance", "/alerts", "/cockpit", "/templates"].forEach(
    (p) => revalidatePath(p)
  );
}

export async function resolveIncident(id: string) {
  const a = await actor();
  const admin = createSupabaseAdmin();
  await admin
    .from("incidents")
    .update({ status: "Resolved", resolved_at: new Date().toISOString(), resolved_by: a.name })
    .eq("id", id);
  await logAction({ actor: a.name, actorRole: a.role, action: "resolve_incident", targetType: "incident", targetId: id });
  revalidateAll();
  return { ok: true };
}

export async function assignIncident(id: string, assignee: string) {
  const a = await actor();
  const admin = createSupabaseAdmin();
  await admin.from("incidents").update({ assignee }).eq("id", id);
  await logAction({ actor: a.name, actorRole: a.role, action: "assign_incident", targetType: "incident", targetId: id, payload: { assignee } });
  revalidateAll();
  return { ok: true };
}

export async function stabilizeCohort11() {
  const a = await actor();
  const admin = createSupabaseAdmin();
  await admin
    .from("cohorts")
    .update({
      risk: "Green",
      stabilized: true,
      headline:
        "STABILIZED: Jamie suspended pending review, UK backup deploying for Friday, written response drafted for Sarah Chen.",
    })
    .eq("id", 11);
  await admin
    .from("incidents")
    .update({ status: "Resolved", resolved_at: new Date().toISOString(), resolved_by: a.name })
    .in("id", ["INC-2041", "INC-2045", "INC-2039"]);
  const slack = await sendSlack(
    ":rotating_light: *Cohort 11 stabilized* — Jamie Whitford suspended pending facilitator review. Backup being deployed for Friday 4-6pm. Sarah Chen response drafted.",
    "OpsPulse · triggered by " + a.name
  );
  await logAction({ actor: a.name, actorRole: a.role, action: "stabilize_cohort", targetType: "cohort", targetId: "C11", payload: { slack } });
  revalidateAll();
  return { ok: true, slack };
}

export async function remedyOnboarding12() {
  const a = await actor();
  const admin = createSupabaseAdmin();
  await admin
    .from("cohorts")
    .update({
      risk: "Amber",
      onboarding_status: "Manually Remedied",
      email_delivery_pct: 100,
      transfer_requests: 2,
      headline:
        "Welcome pack manually sent to all 12. Transfer requests worked 1:1; automation retro scheduled.",
    })
    .eq("id", 12);
  await admin
    .from("incidents")
    .update({ status: "Resolved", resolved_at: new Date().toISOString(), resolved_by: a.name })
    .eq("id", "INC-2042");
  const { data: tpl } = await admin.from("comms_templates").select("*").eq("id", "TPL-WELCOME").single();
  const email = await sendEmail({
    subject: tpl?.subject ?? "Your BlueDot welcome pack",
    text: tpl?.body ?? "Welcome pack.",
  });
  await logAction({ actor: a.name, actorRole: a.role, action: "remedy_onboarding", targetType: "cohort", targetId: "C12", payload: { email } });
  revalidateAll();
  return { ok: true, email };
}

export async function assignBackup(backup: BackupFacilitator, shiftKey: string, shiftLabel: string, cohortCode: string) {
  const a = await actor();
  const admin = createSupabaseAdmin();
  await admin.from("backups").update({ status: "Busy" }).eq("id", backup.id);
  await admin.from("assignments").insert({
    backup_id: backup.id,
    cohort_code: cohortCode,
    shift_key: shiftKey,
    shift_label: shiftLabel,
    rate: backup.cost_per_session,
    created_by: a.name,
  });
  if (cohortCode === "C10") {
    await admin
      .from("incidents")
      .update({ status: "Resolved", resolved_at: new Date().toISOString(), resolved_by: a.name })
      .eq("id", "INC-2038");
    await admin
      .from("cohorts")
      .update({ risk: "Green", headline: `Cover confirmed: ${backup.name} runs Thursday 6-8pm. Tom to brief.` })
      .eq("id", 10);
  }
  const slack = await sendSlack(
    `:white_check_mark: *${backup.name}* assigned to *${shiftLabel}* (${cohortCode}) at £${backup.cost_per_session}/session.`,
    "OpsPulse · #ops-facilitators"
  );
  const invite = buildSessionInvite({
    title: `BlueDot cover — ${cohortCode} (${shiftLabel})`,
    facilitator: backup.name,
    shiftLabel,
  });
  await logAction({ actor: a.name, actorRole: a.role, action: "assign_backup", targetType: "cohort", targetId: cohortCode, payload: { backup: backup.name, rate: backup.cost_per_session, slack } });
  revalidateAll();
  return { ok: true, slack, ics: invite.ics, icsName: `cover-${cohortCode}.ics` };
}

export async function haltAutoPay() {
  const a = await actor();
  const admin = createSupabaseAdmin();
  await admin
    .from("incidents")
    .update({ status: "Resolved", resolved_at: new Date().toISOString(), resolved_by: a.name })
    .eq("id", "INC-2047");
  const email = await sendEmail({
    to: process.env.DIGEST_TO,
    subject: "Notion invoice #20451 — auto-pay halted, escalation",
    text:
      "Halted auto-pay on Notion invoice #20451 ($48,000 vs $4,800 last year). Root cause: domain-capture auto-provisioned ~215 external seats. Requesting sign-off to claw back and request a corrected invoice. — OpsPulse",
  });
  await logAction({ actor: a.name, actorRole: a.role, action: "halt_autopay", targetType: "invoice", targetId: "#20451", payload: { email } });
  revalidateAll();
  return { ok: true, email };
}

export async function runMonitorsAction() {
  const a = await actor();
  const result = await runMonitors();
  // Fire a Slack heads-up if anything new was created.
  if (result.created > 0) {
    await sendSlack(
      `:satellite_antenna: OpsPulse monitors flagged ${result.created} new alert(s).`,
      "OpsPulse · monitors"
    );
  }
  await logAction({ actor: a.name, actorRole: a.role, action: "run_monitors", targetType: "monitors", payload: { ...result, fresh: undefined } });
  revalidateAll();
  return { ok: true, created: result.created, findings: result.findingsCount };
}

export async function acknowledgeAlert(id: number) {
  const a = await actor();
  const admin = createSupabaseAdmin();
  await admin.from("alerts").update({ acknowledged: true }).eq("id", id);
  await logAction({ actor: a.name, actorRole: a.role, action: "ack_alert", targetType: "alert", targetId: String(id) });
  revalidateAll();
  return { ok: true };
}

export async function previewDigest() {
  const admin = createSupabaseAdmin();
  const [{ data: cohorts }, { data: incidents }, { data: risks }] = await Promise.all([
    admin.from("cohorts").select("*"),
    admin.from("incidents").select("*"),
    admin.from("risk_register").select("*"),
  ]);
  return composeDigest({
    cohorts: (cohorts ?? []) as Cohort[],
    incidents: (incidents ?? []) as Incident[],
    risks: (risks ?? []) as RiskItem[],
  });
}

export async function sendDigestNow() {
  const a = await actor();
  const { subject, body } = await previewDigest();
  const email = await sendEmail({ to: process.env.DIGEST_TO, subject, text: body });
  await logAction({ actor: a.name, actorRole: a.role, action: "send_digest", targetType: "digest", payload: { email } });
  return { ok: email.ok, detail: email.detail, demoMode: email.demoMode };
}

export async function sendTemplate(templateId: string, to?: string) {
  const a = await actor();
  const admin = createSupabaseAdmin();
  const { data: tpl } = await admin.from("comms_templates").select("*").eq("id", templateId).single();
  if (!tpl) return { ok: false, detail: "Template not found" };
  const email = await sendEmail({ to, subject: tpl.subject, text: tpl.body });
  await logAction({ actor: a.name, actorRole: a.role, action: "send_template", targetType: "template", targetId: templateId, payload: { email } });
  return { ok: email.ok, detail: email.detail, demoMode: email.demoMode };
}
