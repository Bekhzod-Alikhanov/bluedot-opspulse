"use client";

import { History, User } from "lucide-react";
import type { ActionLogEntry } from "@/lib/types";
import ResetDemoButton from "@/components/ResetDemoButton";

const ACTION_LABEL: Record<string, string> = {
  resolve_incident: "resolved incident",
  assign_incident: "assigned incident",
  create_incident: "created incident",
  snooze_incident: "snoozed incident",
  unsnooze_incident: "un-snoozed incident",
  update_notes: "updated notes on",
  stabilize_cohort: "stabilized",
  remedy_onboarding: "remedied onboarding for",
  assign_backup: "deployed backup to",
  halt_autopay: "halted auto-pay on",
  run_monitors: "ran monitors",
  ack_alert: "acknowledged alert",
  send_template: "sent template",
  send_digest: "sent leadership digest",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ActivityLog({ entries }: { entries: ActionLogEntry[] }) {
  return (
    <div className="space-y-6">
      <header className="animate-fade-up flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-50">
            <History className="h-6 w-6 text-signal" /> Activity Log
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Every operator action, stamped with who and when. The audit trail that lets leadership trust the room without watching it.
          </p>
        </div>
        <ResetDemoButton />
      </header>

      {entries.length === 0 ? (
        <div className="panel rounded-xl p-8 text-center text-sm text-slate-400">No activity recorded yet.</div>
      ) : (
        <div className="panel animate-fade-up rounded-2xl p-2">
          <ol className="relative">
            {entries.map((e, i) => (
              <li key={e.id} className="flex gap-3 px-3 py-3">
                <div className="flex flex-col items-center">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 ring-1 ring-slate-700">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                  </span>
                  {i < entries.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-800" />}
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-sm text-slate-200">
                    <span className="font-semibold">{e.actor}</span>{" "}
                    <span className="text-slate-400">{ACTION_LABEL[e.action] ?? e.action}</span>{" "}
                    {e.target_id && <span className="font-mono text-xs text-slate-300">{e.target_id}</span>}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-slate-600">
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 uppercase tracking-wider text-slate-400">{e.actor_role}</span>
                    <span>{timeAgo(e.created_at)}</span>
                    <span className="text-slate-700">·</span>
                    <span>{new Date(e.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
