"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Inbox, Clock, CheckCircle2, AlarmClock, Filter, UserPlus, Loader2, Search,
  Plus, X, MoonStar, History, Save, BellOff, Bell,
} from "lucide-react";
import type { Incident, Cohort, Priority, ActionLogEntry } from "@/lib/types";
import { rankIncidents, slaInfo, type SlaState } from "@/lib/sla";
import {
  resolveIncident, assignIncident, snoozeIncident, unsnoozeIncident,
  updateIncidentNotes, createIncident, type NewIncidentInput,
} from "@/lib/actions";
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

type StatusFilter = "open" | "snoozed" | "resolved" | "all";

export default function QueueView({
  incidents, cohorts, audit, actorName,
}: {
  incidents: Incident[]; cohorts: Cohort[]; audit: ActionLogEntry[]; actorName: string;
}) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const [status, setStatus] = useState<StatusFilter>("open");
  const [search, setSearch] = useState("");
  const [cohortF, setCohortF] = useState("all");
  const [priorityF, setPriorityF] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    const ch = sb.channel("queue-incidents")
      .on("postgres_changes", { event: "*", schema: "public", table: "incidents" }, () => router.refresh())
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [router]);

  const rows = useMemo(() => {
    let list = rankIncidents(incidents);
    if (status !== "all") list = list.filter((i) => i.status.toLowerCase() === status);
    if (cohortF !== "all") list = list.filter((i) => (cohortF === "none" ? !i.cohort_code : i.cohort_code === cohortF));
    if (priorityF !== "all") list = list.filter((i) => i.priority === priorityF);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
    }
    return list;
  }, [incidents, status, cohortF, priorityF, search]);

  const counts = useMemo(() => ({
    open: incidents.filter((i) => i.status === "Open").length,
    snoozed: incidents.filter((i) => i.status === "Snoozed").length,
    resolved: incidents.filter((i) => i.status === "Resolved").length,
  }), [incidents]);

  const selected = incidents.find((i) => i.id === selectedId) ?? null;

  const act = (id: string, fn: () => Promise<unknown>) => {
    setPendingId(id);
    startTransition(async () => { await fn(); router.refresh(); setPendingId(null); });
  };

  return (
    <div className="space-y-5">
      <header className="animate-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-50">
            <Inbox className="h-6 w-6 text-signal" /> Triage Queue
          </h1>
          <p className="mt-1 text-sm text-slate-400">One ranked inbox for the whole pile. Priority &times; SLA, newest signal up top.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-lg bg-signal px-3.5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-signal-soft">
          <Plus className="h-4 w-4" /> New incident
        </button>
      </header>

      {/* Toolbar */}
      <div className="panel animate-fade-up flex flex-wrap items-center gap-2 rounded-xl p-2.5">
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/50 p-1 font-mono text-[11px]">
          <Filter className="ml-1.5 h-3 w-3 text-slate-600" />
          {(["open", "snoozed", "resolved", "all"] as StatusFilter[]).map((f) => (
            <button key={f} onClick={() => setStatus(f)} className={`rounded-md px-2 py-1 uppercase tracking-wider transition ${status === f ? "bg-slate-800 text-slate-100" : "text-slate-500 hover:text-slate-300"}`}>
              {f}{f !== "all" && counts[f as keyof typeof counts] > 0 ? ` ${counts[f as keyof typeof counts]}` : ""}
            </button>
          ))}
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-2.5 py-1.5">
          <Search className="h-3.5 w-3.5 text-slate-600" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, description, id…" className="w-full bg-transparent font-mono text-[12px] text-slate-200 outline-none placeholder:text-slate-600" />
        </div>
        <select value={cohortF} onChange={(e) => setCohortF(e.target.value)} className="rounded-lg border border-slate-800 bg-slate-900/50 px-2.5 py-1.5 font-mono text-[11px] text-slate-300 outline-none">
          <option value="all">All cohorts</option>
          {cohorts.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
          <option value="none">Org-level</option>
        </select>
        <select value={priorityF} onChange={(e) => setPriorityF(e.target.value)} className="rounded-lg border border-slate-800 bg-slate-900/50 px-2.5 py-1.5 font-mono text-[11px] text-slate-300 outline-none">
          <option value="all">All priorities</option>
          <option value="P0">P0</option><option value="P1">P1</option><option value="P2">P2</option>
        </select>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {rows.length === 0 && <div className="panel rounded-xl p-8 text-center text-sm text-slate-400">Nothing matches these filters.</div>}
        {rows.map((inc, idx) => {
          const sla = slaInfo(inc.sla_due, now);
          const resolved = inc.status === "Resolved";
          const snoozed = inc.status === "Snoozed";
          const busy = pendingId === inc.id;
          return (
            <article key={inc.id} style={{ animationDelay: `${idx * 25}ms` }}
              className={`panel panel-hover animate-fade-up cursor-pointer rounded-xl p-4 ${inc.priority === "P0" && !resolved && !snoozed ? "crit-glow" : ""} ${resolved ? "opacity-60" : ""}`}
              onClick={() => setSelectedId(inc.id)}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold ring-1 ${PRIORITY_STYLE[inc.priority]}`}>{inc.priority}</span>
                    {resolved ? (
                      <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300 ring-1 ring-emerald-500/30"><CheckCircle2 className="h-3 w-3" /> Resolved{inc.resolved_by ? ` · ${inc.resolved_by}` : ""}</span>
                    ) : snoozed ? (
                      <span className="flex items-center gap-1 rounded-md bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] text-violet-300 ring-1 ring-violet-500/30"><MoonStar className="h-3 w-3" /> Snoozed{inc.snooze_until ? ` · wakes ${slaInfo(inc.snooze_until, now).label.replace(" left", "")}` : ""}</span>
                    ) : (
                      <span className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] ring-1 ${SLA_STYLE[sla.state]}`}><AlarmClock className="h-3 w-3" /> {sla.label}</span>
                    )}
                    {inc.auto_created && <span className="rounded bg-violet-500/15 px-1.5 py-0.5 font-mono text-[9px] uppercase text-violet-300">monitor</span>}
                    {inc.assignee && <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] text-slate-400">{inc.assignee.split(" ")[0]}</span>}
                    <span className="font-mono text-[10px] text-slate-600">{inc.id} · {inc.source}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-slate-100">{inc.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">{inc.description}</p>
                </div>
                {!resolved && (
                  <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => act(inc.id, () => assignIncident(inc.id, actorName))} disabled={busy} className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 font-mono text-[11px] text-slate-300 transition hover:text-slate-100 disabled:opacity-50">
                      <UserPlus className="h-3.5 w-3.5" /> {inc.assignee ? "Reassign" : "Assign me"}
                    </button>
                    <button onClick={() => act(inc.id, () => resolveIncident(inc.id))} disabled={busy} className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-[12px] font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50">
                      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Resolve
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {selected && (
        <DetailDrawer incident={selected} audit={audit.filter((a) => a.target_id === selected.id)} now={now} actorName={actorName}
          onClose={() => setSelectedId(null)} busy={pendingId === selected.id}
          onResolve={() => act(selected.id, () => resolveIncident(selected.id))}
          onAssign={() => act(selected.id, () => assignIncident(selected.id, actorName))}
          onSnooze={(h) => act(selected.id, () => snoozeIncident(selected.id, h))}
          onUnsnooze={() => act(selected.id, () => unsnoozeIncident(selected.id))}
          onSaveNotes={(n) => act(selected.id, () => updateIncidentNotes(selected.id, n))} />
      )}

      {showCreate && (
        <CreateModal cohorts={cohorts} onClose={() => setShowCreate(false)} onCreate={(input) => { setShowCreate(false); startTransition(async () => { await createIncident(input); router.refresh(); }); }} />
      )}
    </div>
  );
}

function DetailDrawer({
  incident, audit, now, onClose, busy, onResolve, onAssign, onSnooze, onUnsnooze, onSaveNotes,
}: {
  incident: Incident; audit: ActionLogEntry[]; now: number; actorName: string; busy: boolean;
  onClose: () => void; onResolve: () => void; onAssign: () => void; onSnooze: (h: number) => void; onUnsnooze: () => void; onSaveNotes: (n: string) => void;
}) {
  const [notes, setNotes] = useState(incident.notes ?? "");
  const sla = slaInfo(incident.sla_due, now);
  const resolved = incident.status === "Resolved";
  const snoozed = incident.status === "Snoozed";

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="panel relative h-full w-full max-w-[480px] animate-drawer-in overflow-y-auto border-l border-slate-800 p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold ring-1 ${PRIORITY_STYLE[incident.priority]}`}>{incident.priority}</span>
            {!resolved && !snoozed && <span className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] ring-1 ${SLA_STYLE[sla.state]}`}><AlarmClock className="h-3 w-3" /> {sla.label}</span>}
            <span className="font-mono text-[10px] text-slate-600">{incident.id}</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200"><X className="h-5 w-5" /></button>
        </div>

        <h2 className="mt-3 text-lg font-bold text-slate-50">{incident.title}</h2>
        <p className="mt-0.5 font-mono text-[11px] text-slate-500">{incident.source}{incident.cohort_code ? ` · ${incident.cohort_code}` : ""}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{incident.description}</p>

        <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-900/60 p-3">
          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" />
          <p className="text-[12px] leading-relaxed text-slate-300">{incident.action}</p>
        </div>

        {/* Notes */}
        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Working notes</p>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="What did you do / decide?" className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-[12px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-signal/40" />
          <button onClick={() => onSaveNotes(notes)} disabled={busy || notes === (incident.notes ?? "")} className="mt-2 flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 font-mono text-[11px] text-slate-300 transition hover:text-slate-100 disabled:opacity-40">
            <Save className="h-3.5 w-3.5" /> Save note
          </button>
        </div>

        {/* Actions */}
        {!resolved && (
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={onResolve} disabled={busy} className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-[12px] font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Resolve
            </button>
            <button onClick={onAssign} disabled={busy} className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 font-mono text-[11px] text-slate-300 transition hover:text-slate-100 disabled:opacity-50">
              <UserPlus className="h-3.5 w-3.5" /> Assign me
            </button>
            {snoozed ? (
              <button onClick={onUnsnooze} disabled={busy} className="flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-2 font-mono text-[11px] text-violet-200 transition hover:bg-violet-500/20 disabled:opacity-50">
                <Bell className="h-3.5 w-3.5" /> Wake now
              </button>
            ) : (
              <>
                <button onClick={() => onSnooze(4)} disabled={busy} className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 font-mono text-[11px] text-slate-300 transition hover:text-slate-100 disabled:opacity-50"><BellOff className="h-3.5 w-3.5" /> Snooze 4h</button>
                <button onClick={() => onSnooze(24)} disabled={busy} className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 font-mono text-[11px] text-slate-300 transition hover:text-slate-100 disabled:opacity-50"><MoonStar className="h-3.5 w-3.5" /> 1 day</button>
              </>
            )}
          </div>
        )}

        {/* Audit history */}
        <div className="mt-6">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500"><History className="h-3 w-3" /> History</p>
          {audit.length === 0 ? (
            <p className="mt-2 text-xs text-slate-600">No actions recorded for this item yet.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {audit.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-1.5">
                  <span className="text-[11px] text-slate-300"><span className="font-semibold">{a.actor}</span> · {a.action.replace(/_/g, " ")}</span>
                  <span className="font-mono text-[10px] text-slate-600">{new Date(a.created_at).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateModal({ cohorts, onClose, onCreate }: { cohorts: Cohort[]; onClose: () => void; onCreate: (i: NewIncidentInput) => void }) {
  const [form, setForm] = useState<NewIncidentInput>({ title: "", priority: "P1", source: "", description: "", action: "", cohort_code: null, slaHours: 24 });
  const valid = form.title.trim() && form.description.trim() && form.action.trim();

  const set = <K extends keyof NewIncidentInput>(k: K, v: NewIncidentInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const input = "w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-signal/40";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="panel relative w-full max-w-lg animate-fade-up rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-50">New incident</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 space-y-3">
          <input className={input} placeholder="Title" value={form.title} onChange={(e) => set("title", e.target.value)} />
          <textarea className={input} rows={2} placeholder="Description — what came in?" value={form.description} onChange={(e) => set("description", e.target.value)} />
          <textarea className={input} rows={2} placeholder="Recommended action" value={form.action} onChange={(e) => set("action", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <select className={input} value={form.priority} onChange={(e) => set("priority", e.target.value as Priority)}>
              <option value="P0">P0 — critical</option><option value="P1">P1 — high</option><option value="P2">P2 — normal</option>
            </select>
            <select className={input} value={form.cohort_code ?? ""} onChange={(e) => set("cohort_code", e.target.value || null)}>
              <option value="">Org-level (no cohort)</option>
              {cohorts.map((c) => <option key={c.code} value={c.code}>{c.code} · {c.facilitator}</option>)}
            </select>
            <input className={input} placeholder="Source (e.g. Email, Slack)" value={form.source} onChange={(e) => set("source", e.target.value)} />
            <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3">
              <span className="font-mono text-[11px] text-slate-500">SLA</span>
              <input type="number" min={1} className="w-full bg-transparent py-2 text-sm text-slate-200 outline-none" value={form.slaHours} onChange={(e) => set("slaHours", Number(e.target.value) || 24)} />
              <span className="font-mono text-[11px] text-slate-500">h</span>
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Cancel</button>
          <button onClick={() => valid && onCreate(form)} disabled={!valid} className="flex items-center gap-1.5 rounded-lg bg-signal px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-signal-soft disabled:opacity-40">
            <Plus className="h-4 w-4" /> Create incident
          </button>
        </div>
      </div>
    </div>
  );
}
