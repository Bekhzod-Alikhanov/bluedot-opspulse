import type { Incident, Priority } from "./types";

// System Health = 100 − Σ(health_impact of open incidents).
export function computeHealth(incidents: Incident[]): number {
  const deduction = incidents
    .filter((i) => i.status === "Open")
    .reduce((sum, i) => sum + i.health_impact, 0);
  return Math.max(0, Math.min(100, 100 - deduction));
}

export function criticalCount(incidents: Incident[]): number {
  return incidents.filter(
    (i) => i.status === "Open" && (i.priority === "P0" || i.priority === "P1")
  ).length;
}

export function pendingInvoices(incidents: Incident[]): number {
  return incidents.filter(
    (i) => i.status === "Open" && i.cohort_code === null && i.title.toLowerCase().includes("invoice")
  ).length;
}

export type SlaState = "overdue" | "urgent" | "soon" | "ok" | "none";

export interface SlaInfo {
  state: SlaState;
  label: string;
  ms: number; // signed: negative = overdue
}

// Pure time-math; formatting of the live countdown happens client-side.
export function slaInfo(sla_due: string | null, nowMs = Date.now()): SlaInfo {
  if (!sla_due) return { state: "none", label: "No SLA", ms: 0 };
  const ms = new Date(sla_due).getTime() - nowMs;
  const abs = Math.abs(ms);
  const h = Math.floor(abs / 3_600_000);
  const m = Math.floor((abs % 3_600_000) / 60_000);
  const hm = h >= 1 ? `${h}h ${m}m` : `${m}m`;
  if (ms < 0) return { state: "overdue", label: `${hm} overdue`, ms };
  if (ms < 4 * 3_600_000) return { state: "urgent", label: `${hm} left`, ms };
  if (ms < 24 * 3_600_000) return { state: "soon", label: `${hm} left`, ms };
  return { state: "ok", label: `${hm} left`, ms };
}

const PRIORITY_RANK: Record<Priority, number> = { P0: 0, P1: 1, P2: 2 };

// Queue order: open first, then priority, then soonest SLA.
export function rankIncidents(incidents: Incident[]): Incident[] {
  return [...incidents].sort((a, b) => {
    if (a.status !== b.status) return a.status === "Open" ? -1 : 1;
    if (a.priority !== b.priority)
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    const at = a.sla_due ? new Date(a.sla_due).getTime() : Infinity;
    const bt = b.sla_due ? new Date(b.sla_due).getTime() : Infinity;
    return at - bt;
  });
}
