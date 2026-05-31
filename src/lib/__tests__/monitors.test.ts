import { describe, it, expect } from "vitest";
import { evaluateMonitors } from "../monitors";
import type { Cohort, Monitor, RoundMetric } from "../types";

const monitors: Monitor[] = [
  { id: "MON-EMAIL", name: "email", description: "", rule_key: "email_delivery", severity: "P1", enabled: true, last_run: null, last_status: null },
  { id: "MON-PULSE", name: "pulse", description: "", rule_key: "pulse_drop", severity: "P0", enabled: true, last_run: null, last_status: null },
  { id: "MON-INVOICE", name: "invoice", description: "", rule_key: "invoice_variance", severity: "P2", enabled: true, last_run: null, last_status: null },
  { id: "MON-OFF", name: "disabled", description: "", rule_key: "pulse_drop", severity: "P0", enabled: false, last_run: null, last_status: null },
];

function cohort(p: Partial<Cohort>): Cohort {
  return {
    id: 1, round_id: 4, code: "C1", name: "C1", facilitator: "F", schedule: "s", shift_key: "k",
    pulse: { w1: 4.5, w2: 4.5, w3: 4.5, w4: 4.5 }, onboarding_status: "Complete",
    email_delivery_pct: 100, transfer_requests: 0, participants: 10, risk: "Green",
    headline: "", stabilized: false, ...p,
  };
}

const metrics: RoundMetric[] = [
  { round_id: 3, avg_pulse: 4.4, completion_pct: 84, nps: 52, facilitator_cost: 9600, vendor_cost: 4800, transfers: 5, at_risk_cohorts: 1 },
  { round_id: 4, avg_pulse: 3.9, completion_pct: 0, nps: 0, facilitator_cost: 10800, vendor_cost: 48000, transfers: 11, at_risk_cohorts: 3 },
];

describe("evaluateMonitors", () => {
  it("flags an email-delivery failure", () => {
    const f = evaluateMonitors(monitors, [cohort({ code: "C12", email_delivery_pct: 0 })], metrics);
    expect(f.some((x) => x.monitorId === "MON-EMAIL" && x.cohortCode === "C12")).toBe(true);
  });

  it("ignores a remedied onboarding", () => {
    const f = evaluateMonitors(monitors, [cohort({ email_delivery_pct: 0, onboarding_status: "Manually Remedied" })], metrics);
    expect(f.some((x) => x.monitorId === "MON-EMAIL")).toBe(false);
  });

  it("flags a >1.0 pulse drop as P0", () => {
    const f = evaluateMonitors(monitors, [cohort({ code: "C11", pulse: { w1: 4.5, w2: 3.2, w3: 2.1, w4: 2.3 } })], metrics);
    const hit = f.find((x) => x.monitorId === "MON-PULSE");
    expect(hit?.severity).toBe("P0");
    expect(hit?.cohortCode).toBe("C11");
  });

  it("does not flag a stable cohort", () => {
    const f = evaluateMonitors(monitors, [cohort({})], metrics);
    expect(f.some((x) => x.monitorId === "MON-PULSE")).toBe(false);
  });

  it("flags vendor invoice variance over 2x", () => {
    const f = evaluateMonitors(monitors, [cohort({})], metrics);
    expect(f.some((x) => x.monitorId === "MON-INVOICE")).toBe(true);
  });

  it("skips disabled monitors", () => {
    const allOff: Monitor[] = monitors.map((m) => ({ ...m, enabled: false }));
    // Even with a collapsing cohort, nothing fires when every monitor is off.
    const f = evaluateMonitors(allOff, [cohort({ pulse: { w1: 4.5, w2: 3.0, w3: 2.0, w4: 2.0 }, email_delivery_pct: 0 })], metrics);
    expect(f.length).toBe(0);
  });
});
