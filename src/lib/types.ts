// Shared types mirroring the Supabase schema (snake_case as returned by the API).

export type Role = "ops" | "management";
export type RiskStatus = "Green" | "Amber" | "Red";
export type Priority = "P0" | "P1" | "P2";
export type IncidentStatus = "Open" | "Resolved" | "Snoozed";
export type Availability = "Available" | "Busy";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
}

export interface Round {
  id: number;
  name: string;
  number: number;
  status: "completed" | "active" | "planned";
  week: number;
  total_weeks: number;
}

export interface RoundMetric {
  round_id: number;
  avg_pulse: number;
  completion_pct: number;
  nps: number;
  facilitator_cost: number;
  vendor_cost: number;
  transfers: number;
  at_risk_cohorts: number;
}

export interface Cohort {
  id: number;
  round_id: number;
  code: string;
  name: string;
  facilitator: string;
  schedule: string;
  shift_key: string;
  pulse: { w1: number; w2: number; w3: number; w4: number | null };
  onboarding_status: string;
  email_delivery_pct: number;
  transfer_requests: number;
  participants: number;
  risk: RiskStatus;
  headline: string;
  stabilized: boolean;
}

export interface Incident {
  id: string;
  title: string;
  priority: Priority;
  status: IncidentStatus;
  source: string;
  description: string;
  action: string;
  health_impact: number;
  cohort_code: string | null;
  round_id: number | null;
  raised_at: string;
  sla_due: string | null;
  assignee: string | null;
  notes: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  auto_created: boolean;
  snooze_until?: string | null;
}

export interface BackupFacilitator {
  id: string;
  name: string;
  role: "Backup Facilitator" | "Teaching Fellow";
  location: string;
  timezone: string;
  is_uk: boolean;
  status: Availability;
  cost_per_session: number;
  rating: number;
  specialties: string;
}

export interface Monitor {
  id: string;
  name: string;
  description: string;
  rule_key: string;
  severity: Priority;
  enabled: boolean;
  last_run: string | null;
  last_status: string | null;
}

export interface Alert {
  id: number;
  monitor_id: string;
  severity: Priority;
  title: string;
  detail: string;
  cohort_code: string | null;
  incident_id: string | null;
  acknowledged: boolean;
  created_at: string;
}

export interface CommsTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  updated_at: string;
}

export interface RiskItem {
  id: number;
  title: string;
  owner: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  likelihood: string;
  status: "Open" | "Mitigating" | "Closed";
  mitigation: string;
  cohort_code: string | null;
  updated_at: string;
}

export interface ActionLogEntry {
  id: number;
  actor: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export const SYSTEM = {
  course: "Technical AI Safety",
  round: 4,
  week: 4,
  totalWeeks: 5,
  totalStudents: 60,
  totalCohorts: 6,
  backupRate: 80,
  activeRate: 120,
  leadAway: "Sam Dower (course lead) — back online Wednesday",
} as const;
