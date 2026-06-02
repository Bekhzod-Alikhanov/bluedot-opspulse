import { cache } from "react";
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
// Each is wrapped in React cache() so repeated calls within a single request
// (e.g. the layout's health badge + the page's own data) hit Postgres once.

export const getCohorts = cache(async (): Promise<Cohort[]> => {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("cohorts").select("*").order("id");
  return (data ?? []) as Cohort[];
});

export const getIncidents = cache(async (): Promise<Incident[]> => {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("incidents").select("*").order("raised_at", { ascending: false });
  return (data ?? []) as Incident[];
});

export const getBackups = cache(async (): Promise<BackupFacilitator[]> => {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("backups").select("*").order("id");
  return (data ?? []) as BackupFacilitator[];
});

export const getAlerts = cache(async (): Promise<Alert[]> => {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("alerts").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Alert[];
});

export const getMonitors = cache(async (): Promise<Monitor[]> => {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("monitors").select("*").order("id");
  return (data ?? []) as Monitor[];
});

export const getTemplates = cache(async (): Promise<CommsTemplate[]> => {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("comms_templates").select("*").order("category");
  return (data ?? []) as CommsTemplate[];
});

export const getRisks = cache(async (): Promise<RiskItem[]> => {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("risk_register").select("*").order("id");
  return (data ?? []) as RiskItem[];
});

export const getRounds = cache(async (): Promise<Round[]> => {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("rounds").select("*").order("id");
  return (data ?? []) as Round[];
});

export const getRoundMetrics = cache(async (): Promise<RoundMetric[]> => {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.from("round_metrics").select("*").order("round_id");
  return (data ?? []) as RoundMetric[];
});

export const getActionLog = cache(async (limit = 50): Promise<ActionLogEntry[]> => {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("actions_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as ActionLogEntry[];
});

export const getActionLogFor = cache(async (targetId: string): Promise<ActionLogEntry[]> => {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("actions_log")
    .select("*")
    .eq("target_id", targetId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as ActionLogEntry[];
});
