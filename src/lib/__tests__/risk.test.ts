import { describe, it, expect } from "vitest";
import { predictRisk } from "../risk";
import type { Cohort } from "../types";

function cohort(p: Partial<Cohort>): Cohort {
  return {
    id: 1, round_id: 4, code: "C1", name: "C1", facilitator: "F", schedule: "s", shift_key: "k",
    pulse: { w1: 4.6, w2: 4.7, w3: 4.6, w4: 4.8 }, onboarding_status: "Complete",
    email_delivery_pct: 100, transfer_requests: 0, participants: 10, risk: "Green",
    headline: "", stabilized: false, ...p,
  };
}

describe("predictRisk", () => {
  it("keeps a steady high-pulse cohort Low", () => {
    const f = predictRisk(cohort({}));
    expect(f.band).toBe("Low");
    expect(f.score).toBeLessThan(30);
  });

  it("scores the collapsing C11 as High or Critical", () => {
    const f = predictRisk(cohort({ code: "C11", pulse: { w1: 4.5, w2: 3.2, w3: 2.1, w4: 2.3 } }));
    expect(f.score).toBeGreaterThanOrEqual(50);
    expect(["High", "Critical"]).toContain(f.band);
  });

  it("flags the onboarding-failure C12 above Low", () => {
    const f = predictRisk(cohort({ code: "C12", pulse: { w1: 3.0, w2: 2.8, w3: 3.1, w4: 2.9 }, email_delivery_pct: 0, transfer_requests: 5 }));
    expect(f.score).toBeGreaterThanOrEqual(30);
    expect(f.factors.find((x) => x.label === "Onboarding failure")!.points).toBeGreaterThan(0);
  });

  it("fires the trajectory signal early — week 2 already elevated", () => {
    // Only weeks 1-2 known (w3=w2, w4=null): a 1.3 drop should already register.
    const early = predictRisk(cohort({ pulse: { w1: 4.5, w2: 3.2, w3: 3.2, w4: null } }));
    expect(early.factors.find((x) => x.label === "Steep pulse decline")!.points).toBeGreaterThan(15);
  });

  it("names the dominant driver", () => {
    const f = predictRisk(cohort({ email_delivery_pct: 0 }));
    expect(f.driver.length).toBeGreaterThan(0);
  });
});
