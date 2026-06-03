"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing, Radar, Play, Check, ShieldCheck, Loader2, Zap,
} from "lucide-react";
import type { Alert, Monitor, Priority } from "@/lib/types";
import { runMonitorsAction, acknowledgeAlert } from "@/lib/actions";
import { monitorPreviewFindings } from "@/lib/workTestBrief";

const SEV: Record<Priority, string> = {
  P0: "bg-rose-500/15 text-rose-300 ring-rose-500/40",
  P1: "bg-amber-500/15 text-amber-300 ring-amber-500/40",
  P2: "bg-sky-500/15 text-sky-300 ring-sky-500/40",
};

export default function AlertsView({ monitors, alerts }: { monitors: Monitor[]; alerts: Alert[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [ackId, setAckId] = useState<number | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const open = alerts.filter((a) => !a.acknowledged);
  const ackd = alerts.filter((a) => a.acknowledged);

  const runNow = () => startTransition(async () => {
    const res = await runMonitorsAction();
    setBanner(res.created > 0 ? `${res.created} new alert(s) raised from ${res.findings} findings.` : `All ${res.findings} checks evaluated — no new alerts.`);
    router.refresh();
    setTimeout(() => setBanner(null), 5000);
  });

  const ack = (id: number) => { setAckId(id); startTransition(async () => { await acknowledgeAlert(id); router.refresh(); setAckId(null); }); };

  return (
    <div className="space-y-6">
      <header className="animate-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-50"><BellRing className="h-6 w-6 text-signal" /> Monitors &amp; Alerts</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">Continuous checks that catch silent failures before Monday. Pull becomes push: the C12 0/12 onboarding gap would have alerted Thursday, not festered to 09:00 Monday.</p>
        </div>
        <button onClick={runNow} disabled={pending} className="flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-signal-soft disabled:opacity-60">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run checks now
        </button>
      </header>

      {banner && <div className="panel rounded-xl border-signal/30 p-3 text-center font-mono text-[12px] text-signal">{banner}</div>}

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200"><Radar className="h-4 w-4 text-slate-400" /> Active monitors</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {monitors.map((m, i) => (
            <div key={m.id} style={{ animationDelay: `${i * 40}ms` }} className="panel animate-fade-up rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-100">{m.name}</p>
                <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold ring-1 ${SEV[m.severity]}`}>{m.severity}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{m.description}</p>
              <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-slate-600">
                <span className={`flex items-center gap-1 ${m.enabled ? "text-emerald-400" : "text-slate-500"}`}><span className={`h-1.5 w-1.5 rounded-full ${m.enabled ? "bg-emerald-400" : "bg-slate-600"}`} />{m.enabled ? "Enabled" : "Off"}</span>
                <span>{m.last_run ? `last run · ${m.last_status ?? ""}` : "not yet run"}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200"><Zap className="h-4 w-4 text-amber-400" /> Alert feed{open.length > 0 && <span className="font-mono text-[11px] text-slate-500">({open.length} open)</span>}</h2>
        {open.length === 0 && ackd.length === 0 && (
          <div className="panel rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-100">Preview: what the Monday sweep catches</p>
                <p className="mt-1 text-xs text-slate-500">Hit <span className="text-signal">Run checks now</span> to create live alerts; these seeded findings show the expected signal when the feed is empty.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-2">
              {monitorPreviewFindings.map((finding) => (
                <article key={finding.id} className="rounded-lg border border-slate-800 bg-slate-900/45 p-3">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold ring-1 ${SEV[finding.severity]}`}>{finding.severity}</span>
                    {finding.cohortCode && <span className="font-mono text-[10px] text-slate-500">{finding.cohortCode}</span>}
                    <span className="font-mono text-[10px] text-slate-600">{finding.monitor}</span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-semibold text-slate-100">{finding.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{finding.detail}</p>
                </article>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2.5">
          {open.map((a) => (
            <article key={a.id} className={`panel animate-fade-up rounded-xl p-4 ${a.severity === "P0" ? "crit-glow" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold ring-1 ${SEV[a.severity]}`}>{a.severity}</span>
                    {a.cohort_code && <span className="font-mono text-[10px] text-slate-500">{a.cohort_code}</span>}
                    <span className="font-mono text-[10px] text-slate-600">{a.monitor_id}</span>
                  </div>
                  <h3 className="mt-1.5 text-sm font-semibold text-slate-100">{a.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{a.detail}</p>
                </div>
                <button onClick={() => ack(a.id)} disabled={ackId === a.id} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 font-mono text-[11px] text-slate-300 transition hover:border-slate-600 hover:text-slate-100 disabled:opacity-50">
                  {ackId === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Acknowledge
                </button>
              </div>
            </article>
          ))}
          {ackd.map((a) => (
            <article key={a.id} className="panel rounded-xl p-3 opacity-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-mono text-[10px] text-slate-500">{a.severity}</span>
                <p className="text-xs text-slate-300">{a.title}</p>
                <span className="ml-auto font-mono text-[10px] text-emerald-400">acknowledged</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
