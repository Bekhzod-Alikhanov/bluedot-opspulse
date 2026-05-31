"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlarmClock,
  Filter,
  UserPlus,
  Loader2,
} from "lucide-react";
import type { Incident, Priority } from "@/lib/types";
import { rankIncidents, slaInfo, type SlaState } from "@/lib/sla";
import { resolveIncident, assignIncident } from "@/lib/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const PRIORITY_STYLE: Record<Priority, string> = {
  P0: "bg-rose-500/15 text-rose-300 ring-rose-500/40",
  P1: "bg-amber-500/15 text-amber-300 ring-amber-500/40",
  P2: "bg-sky-500/15 text-sky-300 ring-sky-500/40",
};

const SLA_STYLE: Record<SlaState, string> = {
  overdue: "text-rose-300 bg-rose-500/10 ring-rose-500/30",
  urgent: "text-amber-300 bg-amber-500/10 ring-amber-500/30",
  soon: "text-sky-300 bg-sky-500/10 ring-sky-500/30",
  ok: "text-slate-400 bg-slate-800/60 ring-slate-700",
  none: "text-slate-500 bg-slate-800/40 ring-slate-700",
};

type FilterKey = "open" | "all" | "resolved";

export default function QueueView({
  incidents,
  actorName,
}: {
  incidents: Incident[];
  actorName: string;
}) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const [filter, setFilter] = useState<FilterKey>("open");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Live SLA countdown.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  // Realtime: refresh when incidents change anywhere.
  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    const ch = sb
      .channel("queue-incidents")
      .on("postgres_changes", { event: "*", schema: "public", table: "incidents" }, () => {
        router.refresh();
      })
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, [router]);

  const rows = useMemo(() => {
    const ranked = rankIncidents(incidents);
    if (filter === "open") return ranked.filter((i) => i.status === "Open");
    if (filter === "resolved") return ranked.filter((i) => i.status === "Resolved");
    return ranked;
  }, [incidents, filter]);

  const openCount = incidents.filter((i) => i.status === "Open").length;

  const onResolve = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      await resolveIncident(id);
      router.refresh();
      setPendingId(null);
    });
  };

  const onAssign = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      await assignIncident(id, actorName);
      router.refresh();
      setPendingId(null);
    });
  };

  return (
    <div className="space-y-6">
      <header className="animate-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-50">
            <Inbox className="h-6 w-6 text-signal" /> Triage Queue
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            One ranked inbox for the whole pile. Priority &times; SLA, newest signal up top.
            {" "}{openCount} open.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/50 p-1 font-mono text-[11px]">
          <Filter className="ml-1.5 h-3 w-3 text-slate-600" />
          {(["open", "all", "resolved"] as FilterKey[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-2.5 py-1 uppercase tracking-wider transition ${
                filter === f ? "bg-slate-800 text-slate-100" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-2.5">
        {rows.length === 0 && (
          <div className="panel rounded-xl p-8 text-center text-sm text-emerald-300">
            Queue clear. Nothing open.
          </div>
        )}
        {rows.map((inc, idx) => {
          const sla = slaInfo(inc.sla_due, now);
          const resolved = inc.status === "Resolved";
          const busy = pendingId === inc.id;
          return (
            <article
              key={inc.id}
              style={{ animationDelay: `${idx * 30}ms` }}
              className={`panel animate-fade-up rounded-xl p-4 ${
                inc.priority === "P0" && !resolved ? "crit-glow" : ""
              } ${resolved ? "opacity-60" : ""}`}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold ring-1 ${PRIORITY_STYLE[inc.priority]}`}>
                      {inc.priority}
                    </span>
                    {!resolved && (
                      <span className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] ring-1 ${SLA_STYLE[sla.state]}`}>
                        <AlarmClock className="h-3 w-3" /> {sla.label}
                      </span>
                    )}
                    {resolved && (
                      <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300 ring-1 ring-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" /> Resolved{inc.resolved_by ? ` · ${inc.resolved_by}` : ""}
                      </span>
                    )}
                    {inc.auto_created && (
                      <span className="rounded bg-violet-500/15 px-1.5 py-0.5 font-mono text-[9px] uppercase text-violet-300">monitor</span>
                    )}
                    <span className="font-mono text-[10px] text-slate-600">{inc.id} · {inc.source}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-slate-100">{inc.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{inc.description}</p>
                  <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-slate-900/60 p-2.5">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" />
                    <p className="text-[11px] leading-relaxed text-slate-300">{inc.action}</p>
                  </div>
                </div>

                {!resolved && (
                  <div className="flex shrink-0 items-center gap-2 lg:flex-col lg:items-stretch">
                    <button
                      onClick={() => onAssign(inc.id)}
                      disabled={busy}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 font-mono text-[11px] text-slate-300 transition hover:border-slate-600 hover:text-slate-100 disabled:opacity-50"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      {inc.assignee ? inc.assignee.split(" ")[0] : "Assign me"}
                    </button>
                    <button
                      onClick={() => onResolve(inc.id)}
                      disabled={busy}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-[12px] font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                    >
                      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
