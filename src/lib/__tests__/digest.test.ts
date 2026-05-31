import { describe, it, expect } from "vitest";
import { composeDigest } from "../digest";
import type { Cohort, Incident, RiskItem } from "../types";

function inc(p: Partial<Incident>): Incident {
  return {
    id: "INC-1", title: "t", priority: "P2", status: "Open", source: "s", description: "d",
    action: "a", health_impact: 0, cohort_code: null, round_id: 4, raised_at: "", sla_due: null,
    assignee: null, notes: null, resolved_at: null, resolved_by: null, auto_created: false, ...p,
  };
}
function cohort(p: Partial<Cohort>): Cohort {
  return {
    id: 1, round_id: 4, code: "C1", name: "C1", facilitator: "F", schedule: "s", shift_key: "k",
    pulse: { w1: 4, w2: 4, w3: 4, w4: 4 }, onboarding_status: "Complete", email_delivery_pct: 100,
    transfer_requests: 0, participants: 10, risk: "Green", headline: "", stabilized: false, ...p,
  };
}

const risks: RiskItem[] = [
  { id: 1, title: "Reputation event", owner: "Ops", severity: "Critical", likelihood: "High", status: "Mitigating", mitigation: "m", cohort_code: "C11", updated_at: "" },
  { id: 2, title: "Closed one", owner: "Ops", severity: "Low", likelihood: "Low", status: "Closed", mitigation: "m", cohort_code: null, updated_at: "" },
];

describe("composeDigest", () => {
  it("reports health and surfaces P0 as a decision", () => {
    const { subject, body } = composeDigest({
      cohorts: [cohort({ code: "C11", risk: "Red" })],
      incidents: [inc({ id: "INC-P0", priority: "P0", health_impact: 12, title: "Escalation" })],
      risks,
    });
    expect(subject).toContain("health 88%");
    expect(body).toContain("NEEDS A DECISION FROM YOU");
    expect(body).toContain("Escalation");
    expect(body).toContain("C11"); // at-risk cohort listed
  });

  it("lists only open risks", () => {
    const { body } = composeDigest({ cohorts: [cohort({})], incidents: [], risks });
    expect(body).toContain("Reputation event");
    expect(body).not.toContain("Closed one");
  });

  it("says nothing blocking when no decisions", () => {
    const { body } = composeDigest({ cohorts: [cohort({})], incidents: [inc({ priority: "P2", title: "minor" })], risks: [] });
    expect(body).toContain("Nothing blocking");
  });
});
