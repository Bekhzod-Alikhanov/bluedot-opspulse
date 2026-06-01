import { createSupabaseServerClient } from "./supabase/server";
import type {
  Alert,
  BackupFacilitator,
  Cohort,
  CommsTemplate,
  Incident,
  Monitor,
  RiskItem,
  Round,
  RoundMetric,
  ActionLogEntry,
} from "./types";

// All reads go through the user-scoped server client (RLS: authenticated read).

export async function getCohorts(): Promise<Cohort[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("cohorts").select("*").order("id");
  return (data ?? []) as Cohort[];
}

export async function getIncidents(): Promise<Incident[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("incidents").select("*").order("raised_at", { ascending: false });
  return (data ?? []) as Incident[];
}

export async function getBackups(): Promise<BackupFacilitator[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("backups").select("*").order("id");
  return (data ?? []) as BackupFacilitator[];
}

export async function getAlerts(): Promise<Alert[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("alerts").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Alert[];
}

export async function getMonitors(): Promise<Monitor[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("monitors").select("*").order("id");
  return (data ?? []) as Monitor[];
}

export async function getTemplates(): Promise<CommsTemplate[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("comms_templates").select("*").order("category");
  return (data ?? []) as CommsTemplate[];
}

export async function getRisks(): Promise<RiskItem[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("risk_register").select("*").order("id");
  return (data ?? []) as RiskItem[];
}

export async function getRounds(): Promise<Round[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("rounds").select("*").order("id");
  return (data ?? []) as Round[];
}

export async function getRoundMetrics(): Promise<RoundMetric[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("round_metrics").select("*").order("round_id");
  return (data ?? []) as RoundMetric[];
}

export async function getActionLog(limit = 50): Promise<ActionLogEntry[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("actions_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as ActionLogEntry[];
}

export async function getActionLogFor(targetId: string): Promise<ActionLogEntry[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("actions_log")
    .select("*")
    .eq("target_id", targetId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as ActionLogEntry[];
}
