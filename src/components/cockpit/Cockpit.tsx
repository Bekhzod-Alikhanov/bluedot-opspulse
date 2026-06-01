"use client";

import { useState, useTransition } from "react";
import {
  BarChart3, TrendingUp, PoundSterling, ShieldAlert, Mail, Loader2, Trophy, Send, Eye, Gauge,
} from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from "recharts";
import type { Cohort, Incident, RiskItem, Round, RoundMetric } from "@/lib/types";
import { computeHealth } from "@/lib/sla";
import { predictRisk, BAND_STYLE } from "@/lib/risk";
import { previewDigest, sendDigestNow } from "@/lib/actions";

const SEV_STYLE: Record<string, string> = {
  Critical: "bg-rose-500/15 text-rose-300 ring-rose-500/40",
  High: "bg-amber-500/15 text-amber-300 ring-amber-500/40",
  Medium: "bg-sky-500/15 text-sky-300 ring-sky-500/40",
  Low: "bg-slate-700/40 text-slate-300 ring-slate-600",
};
const STATUS_STYLE: Record<string, string> = {
  Open: "text-rose-300", Mitigating: "text-amber-300", Closed: "text-emerald-300",
};

function tip() {
  return { background: "rgba(8,12,22,0.96)", border: "1px solid #1e293b", borderRadius: "10px", fontSize: "12px", fontFamily: "var(--font-plex-mono)", color: "#e2e8f0" };
}

export default function Cockpit({
  rounds, metrics, cohorts, risks, incidents,
}: {
  rounds: Round[]; metrics: RoundMetric[]; cohorts: Cohort[]; risks: RiskItem[]; incidents: Incident[];
}) {
  const [pending, startTransition] = useTransition();
  const [digest, setDigest] = useState<{ subject: string; body: string } | null>(null);
  const [sendMsg, setSendMsg] = useState<string | null>(null);

  const health = computeHealth(incidents);
  const nameOf = (id: number) => rounds.find((r) => r.id === id)?.name ?? `R${id}`;
  const chartData = metrics.map((m) => ({
    round: nameOf(m.round_id),
    facilitator: m.facilitator_cost,
    vendor: m.vendor_cost,
    pulse: m.avg_pulse,
    completion: m.completion_pct || null,
  }));
  const r4 = metrics.find((m) => m.round_id === 4);

  const leaderboard = [...cohorts]
    .map((c) => ({ code: c.code, facilitator: c.facilitator, score: c.pulse.w4 ?? c.pulse.w3, delta: +(((c.pulse.w4 ?? c.pulse.w3) - c.pulse.w1).toFixed(1)) }))
    .sort((a, b) => b.score - a.score);

  const openRisks = risks.filter((r) => r.status !== "Closed");

  const forecasts = [...cohorts]
    .map((c) => ({ cohort: c, forecast: predictRisk(c) }))
    .sort((a, b) => b.forecast.score - a.forecast.score);

  const kpis = [
    { label: "System Health", value: `${health}%`, icon: TrendingUp, tone: health >= 85 ? "text-emerald-300" : "text-amber-300" },
    { label: "At-Risk Cohorts", value: cohorts.filter((c) => c.risk === "Red").length, icon: ShieldAlert, tone: "text-rose-300" },
    { label: "R4 Facilitator Spend", value: `£${(r4?.facilitator_cost ?? 0).toLocaleString()}`, icon: PoundSterling, tone: "text-sky-300" },
    { label: "R4 Vendor Spend", value: `$${(r4?.vendor_cost ?? 0).toLocaleString()}`, icon: PoundSterling, tone: (r4?.vendor_cost ?? 0) > 10000 ? "text-rose-300" : "text-slate-200" },
  ];

  const preview = () => startTransition(async () => { setDigest(await previewDigest()); });
  const send = () => startTransition(async () => {
    const res = await sendDigestNow();
    setSendMsg(res.demoMode ? "Digest simulated (add RESEND_API_KEY + DIGEST_TO to send for real)." : `Digest sent. ${res.detail}`);
    setTimeout(() => setSendMsg(null), 5000);
  });

  return (
    <div className="space-y-7">
      <header className="animate-fade-up">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-50"><BarChart3 className="h-6 w-6 text-violet-300" /> Leadership Cockpit</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">For Dewi &amp; Li-Lian: course health across rounds, cost, and the open-risk register — plus the Monday digest. Not a triage console; the decisions that need you, surfaced.</p>
      </header>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="panel panel-hover animate-fade-up rounded-2xl p-5" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{k.label}</span>
                <Icon className={`h-4 w-4 ${k.tone}`} />
              </div>
              <p className={`tabular mt-3 font-mono text-3xl font-bold ${k.tone}`}>{k.value}</p>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="panel animate-fade-up rounded-2xl p-5 xl:col-span-3">
          <h2 className="text-sm font-semibold text-slate-200">Cost &amp; Quality by Round</h2>
          <p className="font-mono text-[11px] text-slate-500">Facilitator + vendor spend (bars) vs average pulse (line)</p>
          <div className="mt-4 h-[280px]" role="img" aria-label="Combined chart of facilitator and vendor spend as bars with average pulse as a line, across rounds. Round 4 vendor spend spikes to 48000 dollars.">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="round" stroke="#475569" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#1e293b" }} />
                <YAxis yAxisId="cost" stroke="#475569" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <YAxis yAxisId="pulse" orientation="right" domain={[3, 5]} stroke="#475569" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tip()} cursor={{ fill: "#1e293b33" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar yAxisId="cost" dataKey="facilitator" name="Facilitator £" fill="#38bdf8" fillOpacity={0.7} radius={[3, 3, 0, 0]} maxBarSize={26} />
                <Bar yAxisId="cost" dataKey="vendor" name="Vendor $" radius={[3, 3, 0, 0]} maxBarSize={26}>
                  {chartData.map((d) => <Cell key={d.round} fill={d.vendor > 10000 ? "#fb7185" : "#64748b"} />)}
                </Bar>
                <Line yAxisId="pulse" type="monotone" dataKey="pulse" name="Avg pulse" stroke="#34d399" strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 font-mono text-[11px] text-rose-300/80">R4 vendor spend spikes to $48k — the Notion anomaly, visible at a glance.</p>
        </div>

        <div className="panel animate-fade-up rounded-2xl p-5 xl:col-span-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-200"><Trophy className="h-4 w-4 text-amber-300" /> Facilitator Quality Leaderboard</h2>
          <p className="font-mono text-[11px] text-slate-500">Current round · latest pulse</p>
          <div className="mt-3 space-y-1.5">
            {leaderboard.map((f, i) => (
              <div key={f.code} className="flex items-center gap-3 rounded-lg bg-slate-900/50 px-3 py-2">
                <span className="w-5 font-mono text-xs text-slate-600">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-200">{f.facilitator}</p>
                  <p className="font-mono text-[10px] text-slate-600">{f.code}</p>
                </div>
                <span className={`font-mono text-sm font-semibold ${f.score < 3 ? "text-rose-400" : f.score < 4 ? "text-amber-300" : "text-emerald-300"}`}>{f.score.toFixed(1)}</span>
                <span className={`w-10 text-right font-mono text-[11px] ${f.delta < 0 ? "text-rose-400" : "text-emerald-400"}`}>{f.delta > 0 ? "+" : ""}{f.delta}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Predictive risk forecast */}
      <section className="animate-fade-up">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Gauge className="h-4 w-4 text-violet-300" /> Predictive Risk Forecast
        </h2>
        <p className="mb-3 font-mono text-[11px] text-slate-500">
          Forward score from pulse trajectory, onboarding health &amp; transfer pressure &mdash; catches decline in week 2, not week 4.
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {forecasts.map(({ cohort: c, forecast: f }) => (
            <div key={c.code} className="panel rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{c.code} <span className="font-normal text-slate-500">· {c.facilitator}</span></p>
                  <p className="mt-0.5 font-mono text-[10px] text-slate-600">driver: {f.driver}</p>
                </div>
                <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ring-1 ${BAND_STYLE[f.band]}`}>{f.band}</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${f.score >= 70 ? "bg-rose-400" : f.score >= 50 ? "bg-orange-400" : f.score >= 30 ? "bg-amber-400" : "bg-emerald-400"}`}
                    style={{ width: `${f.score}%` }}
                  />
                </div>
                <span className="tabular w-9 text-right font-mono text-sm font-semibold text-slate-200">{f.score}</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{f.rationale}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="animate-fade-up">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200"><ShieldAlert className="h-4 w-4 text-rose-400" /> Open Risk Register</h2>
        <div className="panel overflow-hidden rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/70 font-mono text-[10px] uppercase tracking-widest text-slate-500">
              <tr><th className="px-4 py-2.5">Risk</th><th className="px-4 py-2.5">Owner</th><th className="px-4 py-2.5">Severity</th><th className="px-4 py-2.5">Status</th><th className="hidden px-4 py-2.5 lg:table-cell">Mitigation</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {openRisks.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-slate-200">{r.title}{r.cohort_code && <span className="ml-1.5 font-mono text-[10px] text-slate-600">{r.cohort_code}</span>}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{r.owner}</td>
                  <td className="px-4 py-3"><span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold ring-1 ${SEV_STYLE[r.severity]}`}>{r.severity}</span></td>
                  <td className={`px-4 py-3 font-mono text-xs ${STATUS_STYLE[r.status]}`}>{r.status}</td>
                  <td className="hidden px-4 py-3 text-xs text-slate-500 lg:table-cell">{r.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel animate-fade-up rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-signal" /><h2 className="text-sm font-semibold text-slate-200">Monday 09:00 Leadership Digest</h2></div>
          <div className="flex items-center gap-2">
            <button onClick={preview} disabled={pending} className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 font-mono text-[11px] text-slate-300 transition hover:text-slate-100 disabled:opacity-60">
              {pending && !digest ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />} Preview
            </button>
            <button onClick={send} disabled={pending} className="flex items-center gap-1.5 rounded-lg bg-signal px-3 py-1.5 text-[12px] font-semibold text-slate-950 transition hover:bg-signal-soft disabled:opacity-60">
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Send now
            </button>
          </div>
        </div>
        <p className="mt-1 font-mono text-[11px] text-slate-500">Auto-sent every Monday 09:00 via cron. Leadership lives in the digest; opens the cockpit when it flags something.</p>
        {digest && (
          <div className="mt-3">
            <p className="font-mono text-[11px] text-slate-400">Subject: <span className="text-slate-200">{digest.subject}</span></p>
            <pre className="mt-2 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950/60 p-4 font-mono text-[12px] leading-relaxed text-slate-300">{digest.body}</pre>
          </div>
        )}
        {sendMsg && <p className="mt-2 font-mono text-[11px] text-emerald-300">{sendMsg}</p>}
      </section>
    </div>
  );
}
