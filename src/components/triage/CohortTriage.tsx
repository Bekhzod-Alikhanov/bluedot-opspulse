"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  X, ShieldAlert, MailWarning, ChevronRight, CircleCheck, Zap, UserX, Clock, Loader2,
} from "lucide-react";
import type { Cohort, RiskStatus } from "@/lib/types";
import { stabilizeCohort11, remedyOnboarding12 } from "@/lib/actions";
import { useEscape } from "@/components/hooks/useEscape";

const RISK_STYLE: Record<RiskStatus, string> = {
  Red: "bg-rose-500/10 text-rose-400 ring-rose-500/30",
  Amber: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
  Green: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
};
const RISK_DOT: Record<RiskStatus, string> = { Red: "bg-rose-400", Amber: "bg-amber-400", Green: "bg-emerald-400" };

const latest = (c: Cohort) => c.pulse.w4 ?? c.pulse.w3;
const delta = (c: Cohort) => +(latest(c) - c.pulse.w1).toFixed(1);

export default function CohortTriage({ cohorts }: { cohorts: Cohort[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = cohorts.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <header className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">Cohort Triage</h1>
        <p className="mt-1 text-sm text-slate-400">Six cohorts, ranked by risk. Click any row to open the action panel.</p>
      </header>

      <div className="hidden grid-cols-12 gap-3 px-4 font-mono text-[10px] uppercase tracking-widest text-slate-600 md:grid">
        <span className="col-span-3">Cohort</span><span className="col-span-2">Facilitator</span>
        <span className="col-span-2">Schedule</span><span className="col-span-2">Pulse</span>
        <span className="col-span-2">Onboarding</span><span className="col-span-1 text-right">Risk</span>
      </div>

      <div className="space-y-2.5">
        {[...cohorts].sort((a, b) => ({ Red: 0, Amber: 1, Green: 2 }[a.risk] - { Red: 0, Amber: 1, Green: 2 }[b.risk])).map((c, idx) => (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            style={{ animationDelay: `${idx * 40}ms` }}
            className={`panel panel-hover grid w-full animate-fade-up grid-cols-2 items-center gap-3 rounded-xl p-4 text-left md:grid-cols-12 ${c.risk === "Red" ? "crit-glow" : ""}`}
          >
            <div className="col-span-2 flex items-center gap-3 md:col-span-3">
              <span className={`h-2 w-2 shrink-0 rounded-full ${RISK_DOT[c.risk]}`} />
              <div>
                <p className="text-sm font-semibold text-slate-100">{c.name} <span className="font-mono text-xs text-slate-500">{c.code}</span></p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 md:max-w-[230px]">{c.headline}</p>
              </div>
            </div>
            <p className="col-span-1 hidden text-sm text-slate-300 md:col-span-2 md:block">{c.facilitator}</p>
            <p className="col-span-1 hidden font-mono text-xs text-slate-400 md:col-span-2 md:block">{c.schedule}</p>
            <div className="col-span-1 hidden items-center gap-2 md:col-span-2 md:flex">
              <span className="font-mono text-sm text-slate-200">{latest(c).toFixed(1)}</span>
              <span className={`font-mono text-[11px] ${delta(c) < 0 ? "text-rose-400" : "text-emerald-400"}`}>{delta(c) > 0 ? "+" : ""}{delta(c)}</span>
            </div>
            <p className="col-span-1 hidden font-mono text-[11px] md:col-span-2 md:block">
              <span className={c.email_delivery_pct === 0 ? "text-rose-400" : c.onboarding_status === "Manually Remedied" ? "text-emerald-400" : "text-slate-400"}>{c.onboarding_status}</span>
            </p>
            <div className="col-span-2 flex items-center justify-end gap-2 md:col-span-1">
              <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ring-1 ${RISK_STYLE[c.risk]}`}>{c.risk}</span>
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setSelectedId(null)} aria-hidden="true" />
          <div role="dialog" aria-modal="true" aria-label={`${selected.name} actions`} className="panel relative h-full w-full max-w-[460px] animate-drawer-in overflow-y-auto border-l border-slate-800 p-6">
            <Drawer cohort={selected} onClose={() => setSelectedId(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

function Drawer({ cohort, onClose }: { cohort: Cohort; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  useEscape(true, onClose);
  const pulses = [
    { wk: "W1", v: cohort.pulse.w1 }, { wk: "W2", v: cohort.pulse.w2 },
    { wk: "W3", v: cohort.pulse.w3 }, { wk: "W4", v: cohort.pulse.w4 },
  ];

  const run = (fn: () => Promise<unknown>) =>
    startTransition(async () => { await fn(); router.refresh(); });

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ring-1 ${RISK_STYLE[cohort.risk]}`}>{cohort.risk} risk</span>
          <h2 className="mt-3 text-xl font-bold text-slate-50">{cohort.name} <span className="font-mono text-base text-slate-500">{cohort.code}</span></h2>
          <p className="mt-0.5 font-mono text-xs text-slate-500">{cohort.facilitator} · {cohort.schedule}</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"><X className="h-5 w-5" /></button>
      </div>

      <p className="mt-4 rounded-lg bg-slate-900/60 p-3 text-sm leading-relaxed text-slate-300">{cohort.headline}</p>

      <div className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Pulse trend</p>
        <div className="mt-2 flex gap-2">
          {pulses.map((p) => (
            <div key={p.wk} className="flex-1 rounded-lg bg-slate-900/60 p-2 text-center">
              <p className="font-mono text-[10px] text-slate-600">{p.wk}</p>
              <p className={`font-mono text-base font-semibold ${p.v === null ? "text-slate-600" : p.v < 3 ? "text-rose-400" : p.v < 4 ? "text-amber-300" : "text-emerald-300"}`}>{p.v === null ? "—" : p.v.toFixed(1)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Fact label="Participants" value={String(cohort.participants)} />
        <Fact label="Transfers" value={String(cohort.transfer_requests)} />
        <Fact label="Email" value={`${cohort.email_delivery_pct}%`} tone={cohort.email_delivery_pct === 0 ? "bad" : "ok"} />
      </div>

      <div className="mt-6">
        {cohort.id === 11 ? (
          cohort.stabilized ? (
            <Resolved title="Cohort 11 stabilized" lines={["Jamie paused pending facilitator review.", "UK backup queued for Friday 4-6pm (see Backup Matcher).", "Written response to Sarah Chen drafted - send before Tuesday EOD."]} />
          ) : (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-rose-200"><ShieldAlert className="h-4 w-4" /> Escalation — Sarah Chen</p>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-300">
                <li>• Public-exposure threat (EA Forum / LinkedIn / X) by Tuesday EOD.</li>
                <li>• Demands: written acknowledgement, facilitator review, marketing-copy fix.</li>
                <li>• Compounded by an anonymous culture complaint + MIT Tech Review inquiry.</li>
              </ul>
              <button onClick={() => run(stabilizeCohort11)} disabled={pending} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-60">
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4" />} Pause Jamie &amp; Deploy Cover
              </button>
              <p className="mt-2 text-center font-mono text-[10px] text-slate-500">Clears the P0 cluster, posts to Slack, recalculates System Health.</p>
            </div>
          )
        ) : cohort.id === 12 ? (
          cohort.onboarding_status === "Manually Remedied" ? (
            <Resolved title="Onboarding remedied" lines={["Welcome pack manually sent to all 12 participants.", "Transfer requests now worked 1:1.", "Automation retro scheduled — must fail loudly next time."]} />
          ) : (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-200"><MailWarning className="h-4 w-4" /> Onboarding automation failure</p>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-300">
                <li>• 0 / 12 welcome emails sent — automation failed silently.</li>
                <li>• Participants arrived unprepared → flat-energy feedback.</li>
                <li>• 5 transfer requests now active as a downstream effect.</li>
              </ul>
              <button onClick={() => run(remedyOnboarding12)} disabled={pending} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-60">
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />} Trigger Manual Backup Blast
              </button>
              <p className="mt-2 text-center font-mono text-[10px] text-slate-500">Sends all 12 welcome packs (Resend) &amp; resolves the ticket.</p>
            </div>
          )
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-300"><Clock className="h-4 w-4 text-slate-500" /> No action required</p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              {cohort.id === 9 ? "Monitoring only. One medical deferral (Marcus D.) on the standard path — clear yes." : "Operating within tolerance. Routine monitoring; no operator action queued this week."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Fact({ label, value, tone }: { label: string; value: string; tone?: "ok" | "bad" }) {
  return (
    <div className="rounded-lg bg-slate-900/60 p-2.5 text-center">
      <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">{label}</p>
      <p className={`mt-0.5 font-mono text-sm font-semibold ${tone === "bad" ? "text-rose-400" : tone === "ok" ? "text-emerald-300" : "text-slate-200"}`}>{value}</p>
    </div>
  );
}

function Resolved({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-emerald-200"><CircleCheck className="h-4 w-4" /> {title}</p>
      <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-300">{lines.map((l) => <li key={l}>• {l}</li>)}</ul>
    </div>
  );
}
