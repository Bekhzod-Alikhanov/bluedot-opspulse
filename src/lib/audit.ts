import "server-only";
import { createSupabaseAdmin } from "./supabase/admin";

// Append an entry to the audit trail. Never throws into the caller's path.
export async function logAction(entry: {
  actor: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  payload?: Record<string, unknown>;
}) {
  try {
    const admin = createSupabaseAdmin();
    await admin.from("actions_log").insert({
      actor: entry.actor,
      actor_role: entry.actorRole,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId ?? null,
      payload: entry.payload ?? null,
    });
  } catch (e) {
    console.error("audit log failed", e);
  }
}
