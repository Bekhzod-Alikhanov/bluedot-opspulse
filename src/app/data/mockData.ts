// =============================================================================
// BlueDot OpsPulse — Core operational data models & seed state
// Technical AI Safety course · Round 4 · Week 4 of 5 · 60 participants
// =============================================================================

export type RiskStatus = "Green" | "Amber" | "Red";
export type OnboardingStatus =
  | "Complete"
  | "Failed (0/12 sent)"
  | "Manually Remedied";
export type Priority = "P0" | "P1" | "P2";
export type IncidentStatus = "Open" | "Resolved";
export type FacilitatorRole = "Backup Facilitator" | "Teaching Fellow";
export type Availability = "Available" | "Busy";

export interface PulseScores {
  w1: number;
  w2: number;
  w3: number;
  w4: number | null; // null = not yet collected this week
}

export interface Cohort {
  id: number;
  code: string; // "C11"
  name: string; // "Cohort 11"
  facilitator: string;
  schedule: string; // "Fridays 4-6pm UK"
  shiftKey: string; // matches BackupMatcher shift keys
  pulse: PulseScores;
  onboardingStatus: OnboardingStatus;
  emailDeliveryPct: number; // welcome-email automation success
  transferRequests: number;
  participants: number;
  risk: RiskStatus;
  headline: string; // one-line operational summary
  stabilized?: boolean; // set true after an operator action
}

export interface Incident {
  id: string;
  title: string;
  priority: Priority;
  status: IncidentStatus;
  cohortId: number | null; // null = org-level (e.g. finance)
  description: string;
  action: string; // recommended immediate action
  healthImpact: number; // points deducted from System Health while Open
  source: string; // where it came from (email, Slack, automation…)
  raisedAt: string;
}

export interface BackupFacilitator {
  id: string;
  name: string;
  role: FacilitatorRole;
  location: string;
  timezone: string; // "GMT (UK)" etc.
  isUK: boolean;
  status: Availability;
  costPerSession: number; // £
  rating: number;
  specialties: string;
}

// -----------------------------------------------------------------------------
// System-level constants
// -----------------------------------------------------------------------------
export const SYSTEM = {
  course: "Technical AI Safety",
  round: 4,
  week: 4,
  totalWeeks: 5,
  totalStudents: 60,
  totalCohorts: 6,
  activeRate: 120, // £ per session, active facilitator
  backupRate: 80, // £ per session, backup facilitator
  leadAway: "Sam Dower (course lead) — back online Wednesday",
  escalationContacts: ["Li-Lian (Head of Product & Eng)", "Dewi Erwan (CEO)"],
} as const;

// Health = 100 − Σ(healthImpact of Open incidents).
// Seed open incidents sum to 32 ⇒ baseline System Health = 68%.
export const HEALTH_BASELINE = 100;

// -----------------------------------------------------------------------------
// Cohorts (7–12)
// -----------------------------------------------------------------------------
export const initialCohorts: Cohort[] = [
  {
    id: 7,
    code: "C7",
    name: "Cohort 7",
    facilitator: "Aisha Rahman",
    schedule: "Mondays 12-2pm UK",
    shiftKey: "mon-12",
    pulse: { w1: 4.6, w2: 4.7, w3: 4.6, w4: 4.8 },
    onboardingStatus: "Complete",
    emailDeliveryPct: 100,
    transferRequests: 0,
    participants: 10,
    risk: "Green",
    headline: "Steady, high engagement. No action required.",
  },
  {
    id: 8,
    code: "C8",
    name: "Cohort 8",
    facilitator: "David Olusegun",
    schedule: "Tuesdays 6-8pm UK",
    shiftKey: "tue-18",
    pulse: { w1: 4.2, w2: 4.3, w3: 4.1, w4: 4.2 },
    onboardingStatus: "Complete",
    emailDeliveryPct: 100,
    transferRequests: 1,
    participants: 10,
    risk: "Green",
    headline: "Steady. One routine schedule-based transfer request.",
  },
  {
    id: 9,
    code: "C9",
    name: "Cohort 9",
    facilitator: "Priya Shankar",
    schedule: "Wednesdays 7-9pm UK",
    shiftKey: "wed-19",
    pulse: { w1: 4.7, w2: 4.8, w3: 4.9, w4: 4.8 },
    onboardingStatus: "Complete",
    emailDeliveryPct: 100,
    transferRequests: 0,
    participants: 10,
    risk: "Green",
    headline: "Popular, highly rated. One medical deferral pending (Marcus D.).",
  },
  {
    id: 10,
    code: "C10",
    name: "Cohort 10",
    facilitator: "Tom Reeves",
    schedule: "Thursdays 6-8pm UK",
    shiftKey: "thu-18",
    pulse: { w1: 4.3, w2: 4.4, w3: 4.2, w4: null },
    onboardingStatus: "Complete",
    emailDeliveryPct: 100,
    transferRequests: 0,
    participants: 10,
    risk: "Amber",
    headline:
      "Facilitator down with flu as of Monday AM. Thursday 6-8pm session needs cover.",
  },
  {
    id: 11,
    code: "C11",
    name: "Cohort 11",
    facilitator: "Jamie Whitford",
    schedule: "Fridays 4-6pm UK",
    shiftKey: "fri-16",
    pulse: { w1: 4.5, w2: 3.2, w3: 2.1, w4: 2.3 },
    onboardingStatus: "Complete",
    emailDeliveryPct: 100,
    transferRequests: 0,
    participants: 10,
    risk: "Red",
    headline:
      "SEVERE: pulse collapsed 4.5 → 2.1. Public-exposure threat (Tue), press inquiry, culture complaint.",
  },
  {
    id: 12,
    code: "C12",
    name: "Cohort 12",
    facilitator: "Ben Carter",
    schedule: "Mondays 6-8pm UK",
    shiftKey: "mon-18",
    pulse: { w1: 3.0, w2: 2.8, w3: 3.1, w4: 2.9 },
    onboardingStatus: "Failed (0/12 sent)",
    emailDeliveryPct: 0,
    transferRequests: 5,
    participants: 12,
    risk: "Red",
    headline:
      "Onboarding automation failed silently (0/12 welcome emails). 5 active transfer requests.",
  },
];

// -----------------------------------------------------------------------------
// Incidents — Open set sums to 32 health points ⇒ 68% baseline
// -----------------------------------------------------------------------------
export const initialIncidents: Incident[] = [
  {
    id: "INC-2041",
    title: "Public-exposure escalation — Cohort 11",
    priority: "P0",
    status: "Open",
    cohortId: 11,
    description:
      "Sarah Chen (senior ML engineer) demands a written response by end of Tuesday or she goes public on EA Forum, LinkedIn & X. Cites lateness, camera off, one-line feedback, and a &quot;world-class facilitators&quot; claim she calls puffery. She has screenshots.",
    action:
      "Acknowledge in writing today, commit to a concrete plan for remaining C11 sessions, open a facilitator review, and align marketing copy.",
    healthImpact: 12,
    source: "Email · Sat 23:48 (cc: Dewi, Sam)",
    raisedAt: "Sat 23:48",
  },
  {
    id: "INC-2038",
    title: "Facilitator down — Thursday cover needed",
    priority: "P1",
    status: "Open",
    cohortId: 10,
    description:
      "Tom Reeves (C10) has flu — high fever, can barely speak. Cannot run Thursday 6-8pm. Gave maximum notice and offered to brief whoever covers.",
    action:
      "Deploy a UK-timezone backup for Thursday 6-8pm at the £80 rate; arrange a 15-min handover from Tom.",
    healthImpact: 7,
    source: "Slack DM · Mon 06:14",
    raisedAt: "Mon 06:14",
  },
  {
    id: "INC-2042",
    title: "Onboarding automation failure — Cohort 12",
    priority: "P1",
    status: "Open",
    cohortId: 12,
    description:
      "Welcome-email automation (T-48h before session 1) failed silently for all 12 C12 participants. Nobody caught it. Participants arrived unprepared — likely root cause of the &quot;flat energy&quot; feedback and 5 transfer requests.",
    action:
      "Manually send the welcome pack to all 12 today, then retro the automation so it fails loudly next time.",
    healthImpact: 7,
    source: "Automation · detected Mon 09:00",
    raisedAt: "Mon 09:00",
  },
  {
    id: "INC-2045",
    title: "Press inquiry — MIT Technology Review",
    priority: "P1",
    status: "Open",
    cohortId: 11,
    description:
      "Hannah Liu (MIT Tech Review) is writing on AI-safety education quality at scale. Wants a quote with a number AND specifically asks about Cohort 11 feedback. Deadline end of Tuesday — same clock as the Sarah Chen threat.",
    action:
      "Loop in Dewi/comms before responding. Do not free-style a quote; provide a calibrated holding line on the record.",
    healthImpact: 3,
    source: "Email · Sat 09:23",
    raisedAt: "Sat 09:23",
  },
  {
    id: "INC-2039",
    title: "Anonymous culture complaint — Cohort 11",
    priority: "P2",
    status: "Open",
    cohortId: 11,
    description:
      "Forwarded by Sam: a participant reports a dismissive comment by Jamie about a community they belong to. Not a formal complaint yet — wants someone at BlueDot to know before the next session.",
    action:
      "Acknowledge privately within 24h, offer a call, log confidentially. Feeds the facilitator review.",
    healthImpact: 1,
    source: "Email · fwd by Sam, Sun 23:42",
    raisedAt: "Sun 23:42",
  },
  {
    id: "INC-2047",
    title: "Notion Enterprise invoice anomaly",
    priority: "P2",
    status: "Open",
    cohortId: null,
    description:
      "Invoice #20451: Notion Enterprise renewal billed at $48,000 vs $4,800 last year — a 10× jump with no explanation in the email body. Auto-pay is armed.",
    action:
      "Halt auto-pay, run root-cause, escalate to Li-Lian with a recommendation before the payment window closes.",
    healthImpact: 2,
    source: "Email · Fri 16:51",
    raisedAt: "Fri 16:51",
  },
];

// -----------------------------------------------------------------------------
// Backup facilitator pool (4 backups @ £80 + 2 Teaching Fellows in reserve)
// -----------------------------------------------------------------------------
export const initialBackups: BackupFacilitator[] = [
  {
    id: "BF-01",
    name: "Nadia Hassan",
    role: "Backup Facilitator",
    location: "London, UK",
    timezone: "GMT (UK)",
    isUK: true,
    status: "Available",
    costPerSession: 80,
    rating: 4.7,
    specialties: "RL safety, evals — trained R3.",
  },
  {
    id: "BF-02",
    name: "Oliver Bennett",
    role: "Backup Facilitator",
    location: "Manchester, UK",
    timezone: "GMT (UK)",
    isUK: true,
    status: "Available",
    costPerSession: 80,
    rating: 4.5,
    specialties: "Interpretability — covered 6 sessions in R3.",
  },
  {
    id: "BF-03",
    name: "Chen Wei",
    role: "Backup Facilitator",
    location: "Singapore",
    timezone: "GMT+8 (SGT)",
    isUK: false,
    status: "Available",
    costPerSession: 80,
    rating: 4.6,
    specialties: "Scalable oversight. Timezone-limited for UK evenings.",
  },
  {
    id: "BF-04",
    name: "Sofia Marchetti",
    role: "Backup Facilitator",
    location: "Lisbon, Portugal",
    timezone: "GMT+1 (WEST)",
    isUK: false,
    status: "Busy",
    costPerSession: 80,
    rating: 4.4,
    specialties: "Policy crossover. Currently covering a maternity cohort.",
  },
  {
    id: "TF-01",
    name: "Dr. Amara Okafor",
    role: "Teaching Fellow",
    location: "London, UK",
    timezone: "GMT (UK)",
    isUK: true,
    status: "Available",
    costPerSession: 120,
    rating: 4.9,
    specialties: "Senior. Reserve only — pulling her stalls cohort design work.",
  },
  {
    id: "TF-02",
    name: "James Park",
    role: "Teaching Fellow",
    location: "Edinburgh, UK",
    timezone: "GMT (UK)",
    isUK: true,
    status: "Busy",
    costPerSession: 120,
    rating: 4.8,
    specialties: "Senior. Mid-curriculum redesign sprint this week.",
  },
];

// -----------------------------------------------------------------------------
// Backup-matcher shift targets (the two live gaps)
// -----------------------------------------------------------------------------
export interface ShiftGap {
  key: string;
  label: string;
  cohortId: number;
  cohortCode: string;
  incidentId: string;
  reason: string;
}

export const shiftGaps: ShiftGap[] = [
  {
    key: "thu-18",
    label: "Thursday 6-8pm UK",
    cohortId: 10,
    cohortCode: "C10",
    incidentId: "INC-2038",
    reason: "Tom Reeves — flu cover",
  },
  {
    key: "fri-16",
    label: "Friday 4-6pm UK",
    cohortId: 11,
    cohortCode: "C11",
    incidentId: "INC-2041",
    reason: "Jamie Whitford — suspended pending review",
  },
];

// -----------------------------------------------------------------------------
// Finance: Notion invoice root-cause breakdown (dramatized)
// -----------------------------------------------------------------------------
export const invoiceAudit = {
  invoiceNo: "#20451",
  vendor: "Notion Enterprise",
  lastYear: 4800,
  thisYear: 48000,
  delta: 43200,
  multiplier: 10,
  rootCause:
    "An unmonitored domain-capture setting auto-provisioned premium Enterprise seats for everyone who signed up with an email on BlueDot&apos;s verified domains — including 215 external course applicants who created workspaces during R4 admissions.",
  breakdown: [
    { label: "Genuine team seats (last year baseline)", seats: 32, unit: 150, amount: 4800 },
    { label: "Auto-provisioned external applicant seats", seats: 215, unit: 200, amount: 43000 },
    { label: "Proration & tax adjustment", seats: 0, unit: 0, amount: 200 },
  ],
  recommendation:
    "Halt auto-pay, disable domain capture, reclaim the 215 phantom seats, and request a corrected invoice (~$4,800–$6,000).",
};
