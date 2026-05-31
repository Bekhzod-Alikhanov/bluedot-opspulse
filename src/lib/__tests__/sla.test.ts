import { describe, it, expect } from "vitest";
import { computeHealth, criticalCount, pendingInvoices, slaInfo, rankIncidents } from "../sla";
import type { Incident } from "../types";

function inc(p: Partial<Incident>): Incident {
  return {
    id: "INC-1", title: "t", priority: "P2", status: "Open", source: "s",
    description: "d", action: "a", health_impact: 0, cohort_code: null,
    round_id: 4, raised_at: new Date().toISOString(), sla_due: null,
    assignee: null, notes: null, resolved_at: null, resolved_by: null,
    auto_created: false, ...p,
  };
}

describe("computeHealth", () => {
  it("is 100 with no open incidents", () => {
    expect(computeHealth([])).toBe(100);
    expect(computeHealth([inc({ status: "Resolved", health_impact: 50 })])).toBe(100);
  });

  it("subtracts open impacts and clamps at 0", () => {
    expect(computeHealth([inc({ health_impact: 12 }), inc({ id: "x", health_impact: 20 })])).toBe(68);
    expect(computeHealth([inc({ health_impact: 250 })])).toBe(0);
  });

  it("ignores snoozed/resolved impacts", () => {
    expect(computeHealth([inc({ health_impact: 10, status: "Snoozed" })])).toBe(100);
  });
});

describe("criticalCount", () => {
  it("counts only open P0/P1", () => {
    const list = [inc({ priority: "P0" }), inc({ id: "b", priority: "P1" }), inc({ id: "c", priority: "P2" }), inc({ id: "d", priority: "P0", status: "Resolved" })];
    expect(criticalCount(list)).toBe(2);
  });
});

describe("pendingInvoices", () => {
  it("counts open org-level invoice incidents", () => {
    expect(pendingInvoices([inc({ title: "Notion invoice anomaly", cohort_code: null })])).toBe(1);
    expect(pendingInvoices([inc({ title: "Notion invoice anomaly", cohort_code: null, status: "Resolved" })])).toBe(0);
  });
});

describe("slaInfo", () => {
  const base = Date.parse("2026-01-01T00:00:00Z");
  it("flags overdue when past due", () => {
    expect(slaInfo(new Date(base - 3_600_000).toISOString(), base).state).toBe("overdue");
  });
  it("flags urgent within 4h", () => {
    expect(slaInfo(new Date(base + 2 * 3_600_000).toISOString(), base).state).toBe("urgent");
  });
  it("flags soon within a day, ok beyond", () => {
    expect(slaInfo(new Date(base + 10 * 3_600_000).toISOString(), base).state).toBe("soon");
    expect(slaInfo(new Date(base + 48 * 3_600_000).toISOString(), base).state).toBe("ok");
  });
  it("returns none for no due date", () => {
    expect(slaInfo(null, base).state).toBe("none");
  });
});

describe("rankIncidents", () => {
  it("orders open-before-resolved, then priority, then soonest SLA", () => {
    const now = Date.now();
    const list = [
      inc({ id: "resolvedP0", priority: "P0", status: "Resolved" }),
      inc({ id: "p2", priority: "P2", sla_due: new Date(now + 1000).toISOString() }),
      inc({ id: "p0-late", priority: "P0", sla_due: new Date(now + 10_000).toISOString() }),
      inc({ id: "p0-soon", priority: "P0", sla_due: new Date(now + 1_000).toISOString() }),
    ];
    const order = rankIncidents(list).map((i) => i.id);
    expect(order[0]).toBe("p0-soon");
    expect(order[1]).toBe("p0-late");
    expect(order[2]).toBe("p2");
    expect(order[3]).toBe("resolvedP0");
  });
});
