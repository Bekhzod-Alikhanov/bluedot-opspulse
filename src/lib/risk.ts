import type { Cohort } from "./types";

export type RiskBand = "Low" | "Elevated" | "High" | "Critical";

export interface RiskForecast {
  score: number; // 0-100, higher = more at risk
  band: RiskBand;
  driver: string; // the largest contributing factor
  rationale: string;
  factors: { label: string; points: number }[];
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

function latest(c: Cohort): number {
  return c.pulse.w4 ?? c.pulse.w3;
}

// Largest single week-on-week drop seen so far (the early-warning signal).
function worstDrop(c: Cohort): number {
  const drops = [
    c.pulse.w1 - c.pulse.w2,
    c.pulse.w2 - c.pulse.w3,
    c.pulse.w4 != null ? c.pulse.w3 - c.pulse.w4 : 0,
  ];
  return Math.max(0, ...drops);
}

function bandFor(score: number): RiskBand {
  if (score >= 70) return "Critical";
  if (score >= 50) return "High";
  if (score >= 30) return "Elevated";
  return "Low";
}

/**
 * Forward-looking risk score blending four signals. Designed so a collapsing
 * cohort (C11) and a botched onboarding (C12) surface as High/Critical, while
 * steady cohorts stay Low — and so the trajectory term fires on the *drop*,
 * catching trouble in week 2 rather than waiting for the floor in week 4.
 */
export function predictRisk(c: Cohort): RiskForecast {
  const pulseRisk = clamp((5 - latest(c)) / 4, 0, 1) * 40; // low pulse
  const trajectoryRisk = clamp(worstDrop(c) / 2, 0, 1) * 35; // steep decline
  const onboardingRisk = clamp((100 - c.email_delivery_pct) / 100, 0, 1) * 15;
  const transferRisk = clamp(c.transfer_requests / 5, 0, 1) * 10;

  const factors = [
    { label: "Low pulse score", points: pulseRisk },
    { label: "Steep pulse decline", points: trajectoryRisk },
    { label: "Onboarding failure", points: onboardingRisk },
    { label: "Transfer-request pressure", points: transferRisk },
  ];
  const score = Math.round(factors.reduce((s, f) => s + f.points, 0));
  const top = [...factors].sort((a, b) => b.points - a.points)[0];
  const band = bandFor(score);

  const rationale =
    band === "Low"
      ? "Operating within tolerance; no early-warning signals."
      : `Driven by ${top.label.toLowerCase()}. Recommend intervention before the next session.`;

  return { score, band, driver: top.label, rationale, factors };
}

export const BAND_STYLE: Record<RiskBand, string> = {
  Critical: "bg-rose-500/15 text-rose-300 ring-rose-500/40",
  High: "bg-orange-500/15 text-orange-300 ring-orange-500/40",
  Elevated: "bg-amber-500/15 text-amber-300 ring-amber-500/40",
  Low: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/40",
};
