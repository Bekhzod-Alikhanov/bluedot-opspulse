import "server-only";
import type { Cohort, Incident, RiskItem } from "./types";
import { computeHealth, criticalCount } from "./sla";

// Compose the Monday-09:00 leadership digest as plain text.
export function composeDigest(opts: {
  cohorts: Cohort[];
  incidents: Incident[];
  risks: RiskItem[];
}): { subject: string; body: string } {
  const { cohorts, incidents, risks } = opts;
  const health = computeHealth(incidents);
  const critical = criticalCount(incidents);
  const open = incidents.filter((i) => i.status === "Open");
  const red = cohorts.filter((c) => c.risk === "Red");
  const decisions = open
    .filter((i) => i.priority === "P0" || i.title.toLowerCase().includes("press") || i.title.toLowerCase().includes("invoice"))
    .slice(0, 3);
  const openRisks = risks.filter((r) => r.status !== "Closed");

  const lines: string[] = [];
  lines.push("OPSPULSE — MONDAY LEADERSHIP DIGEST");
  lines.push("Technical AI Safety · Round 4 · Week 4 of 5");
  lines.push("");
  lines.push(`SYSTEM HEALTH: ${health}%  (${critical} critical incidents open)`);
  lines.push(`AT-RISK COHORTS: ${red.length ? red.map((c) => c.code).join(", ") : "none"}`);
  lines.push("");
  lines.push("NEEDS A DECISION FROM YOU:");
  if (decisions.length === 0) lines.push("  • Nothing blocking — Ops has it.");
  decisions.forEach((d) => lines.push(`  • [${d.priority}] ${d.title} — ${d.action}`));
  lines.push("");
  lines.push("TOP OPEN RISKS:");
  openRisks.slice(0, 4).forEach((r) => lines.push(`  • [${r.severity}] ${r.title} (owner: ${r.owner}) — ${r.status}`));
  lines.push("");
  lines.push("Full detail in the cockpit. Reply here to task Ops directly.");

  return { subject: `OpsPulse digest — health ${health}%, ${critical} critical`, body: lines.join("\n") };
}
