"use client";

import Link from "next/link";
import {
  Users,
  Gauge,
  Siren,
  ReceiptText,
  ArrowUpRight,
  TrendingDown,
  Radio,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import type { Cohort, Incident, Alert, Priority } from "@/lib/types";
import { SYSTEM } from "@/lib/types";
import { computeHealth, criticalCount, pendingInvoices, rankIncidents } from "@/lib/sla";

const COHORT_LINES = [
  { key: "C7", color: "#475569", width: 1.5, dim: true },
  { key: "C8", color: "#64748b", width: 1.5, dim: true },
  { key: "C9", color: "#34d399", width: 2, dim: false },
  { key: "C10", color: "#fbbf24", width: 2, dim: false },
  { key: "C11", color: "#fb7185", width: 3, dim: false },
  { key: "C12", color: "#c084fc", width: 2, dim: false },
];

const PRIORITY_STYLE: Record<Priority, string> = {
  P0: "bg-rose-500/15 text-rose-300 ring-rose-500/40",
  P1: "bg-amber-500/15 text-amber-300 ring-amber-500/40",
  P2: "bg-sky-500/15 text-sky-300 ring-sky-500/40",
};

function tip() {
  return {
    background: "rgba(8,12,22,0.96)",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    fontSize: "12px",
    fontFamily: "var(--font-plex-mono)",
    color: "#e2e8f0",
  };
}

export default function ControlRoom({
  cohorts,
  incidents,
  alerts,
}: {
  cohorts: Cohort[];
  incidents: Incident[];
  alerts: Alert[];
}) {
  const health = computeHealth(incidents);
  const critical = criticalCount(incidents);
  const pending = pendingInvoices(incidents);
  const openAlerts = alerts.filter((a) => !a.acknowledged).length;

  const weeks = ["w1", "w2", "w3", "w4"] as const;
  const byCode = Object.fromEntries(cohorts.map((c) => [c.code, c]));
  const pulseData = weeks.map((wk, i) => {
    const row: Record<string, number | string | null> = { week: `W${i + 1}` };
    cohorts.forEach((c) => (row[c.code] = c.pulse[wk]));
    return row;
  });
  const onboardingData = cohorts.map((c) => ({
    code: c.code,
    delivery: c.email_delivery_pct,
    transfers: c.transfer_requests,
    failed: c.email_delivery_pct === 0,
  }));

  const feed = rankIncidents(incidents)
    .filter((i) => i.status === "Open" && (i.priority === "P0" || i.priority === "P1"))
    .slice(0, 6);

  const kpis = [
    { label: "Active Learners", value: SYSTEM.totalStudents, sub: `${SYSTEM.totalCohorts} cohorts · Round ${SYSTEM.round}`, icon: Users, tone: "text-sky-300", ring: "ring-sky-500/20" },
    { label: "System Health Index", value: `${health}%`, sub: health >= 85 ? "Nominal" : "Below target — action required", icon: Gauge, tone: health >= 85 ? "text-emerald-300" : "text-amber-300", ring: health >= 85 ? "ring-emerald-500/20" : "ring-amber-500/20" },
    { label: "Active Critical Alerts", value: critical, sub: "Open P0 + P1 incidents", icon: Siren, tone: critical > 0 ? "text-rose-300" : "text-emerald-300", ring: critical > 0 ? "ring-rose-500/20" : "ring-emerald-500/20" },
    { label: "Pending Invoices", value: pending, sub: pending > 0 ? "Anomaly awaiting sign-off" : "Cleared", icon: ReceiptText, tone: pending > 0 ? "text-amber-300" : "text-emerald-300", ring: pending > 0 ? "ring-amber-500/20" : "ring-emerald-500/20" },
  ];

  void byCode;

  return (
    <div className="space-y-7">
      <header className="animate-fade-up">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
          <Radio className="h-3.5 w-3.5 text-signal" /> Live · Monday 09:00 BST
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-50">Control Room</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          The weekend pile, triaged. {critical} critical {critical === 1 ? "thread" : "threads"} live,
          {" "}{openAlerts} monitor {openAlerts === 1 ? "alert" : "alerts"} open, two facilitator gaps,
          and a 10&times; invoice anomaly to halt.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="panel panel-hover animate-fade-up rounded-2xl p-5" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{k.label}</span>
                <span className={`rounded-lg bg-slate-900/70 p-1.5 ring-1 ${k.ring}`}>
                  <Icon className={`h-4 w-4 ${k.tone}`} />
                </span>
              </div>
              <p className={`tabular mt-4 font-mono text-4xl font-bold ${k.tone}`}>{k.value}</p>
              <p className="mt-1.5 text-xs text-slate-500">{k.sub}</p>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="panel animate-fade-up rounded-2xl p-5 xl:col-span-3">
          <div className="mb-1 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Facilitator Quality Variance</h2>
              <p className="font-mono text-[11px] text-slate-500">Pulse survey score · weeks 1&ndash;4 · all cohorts</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 font-mono text-[10px] text-rose-300 ring-1 ring-rose-500/30">
              <TrendingDown className="h-3 w-3" /> C11 4.5 &rarr; 2.1
            </span>
          </div>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pulseData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" stroke="#475569" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#1e293b" }} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#475569" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tip()} />
                <Legend iconType="plainline" wrapperStyle={{ fontSize: "11px" }} />
                {COHORT_LINES.map((c) => (
                  <Line key={c.key} type="monotone" dataKey={c.key} stroke={c.color} strokeWidth={c.width} strokeOpacity={c.dim ? 0.45 : 1} dot={{ r: c.key === "C11" ? 3 : 0, fill: c.color }} activeDot={{ r: 4 }} connectNulls={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel animate-fade-up rounded-2xl p-5 xl:col-span-2">
          <h2 className="text-sm font-semibold text-slate-200">Onboarding vs. Transfer Requests</h2>
          <p className="font-mono text-[11px] text-slate-500">Welcome-email delivery &amp; cohort-switch demand</p>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={onboardingData} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="code" stroke="#475569" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#1e293b" }} />
                <YAxis yAxisId="left" domain={[0, 100]} stroke="#475569" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 6]} stroke="#475569" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tip()} cursor={{ fill: "#1e293b33" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar yAxisId="left" dataKey="delivery" name="Email delivery %" radius={[4, 4, 0, 0]} maxBarSize={20}>
                  {onboardingData.map((d) => (
                    <Cell key={d.code} fill={d.failed ? "#fb7185" : "#38bdf8"} fillOpacity={d.failed ? 1 : 0.7} />
                  ))}
                </Bar>
                <Bar yAxisId="right" dataKey="transfers" name="Transfer requests" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 font-mono text-[11px] text-slate-500">
            C12 delivery at 0% correlates with 5 transfer requests &mdash; the silent automation failure, made visible.
          </p>
        </div>
      </section>

      <section className="animate-fade-up">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Siren className="h-4 w-4 text-rose-400" /> Priority Incident Feed
          </h2>
          <Link href="/queue" className="flex items-center gap-1 font-mono text-[11px] text-slate-400 transition hover:text-signal">
            Open triage queue <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {feed.length === 0 && (
            <div className="panel rounded-xl p-6 text-center text-sm text-emerald-300">
              All critical incidents resolved. System nominal.
            </div>
          )}
          {feed.map((inc) => (
            <article key={inc.id} className={`panel rounded-xl p-4 ${inc.priority === "P0" ? "crit-glow" : ""}`}>
              <div className="flex items-center justify-between">
                <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold ring-1 ${PRIORITY_STYLE[inc.priority]}`}>{inc.priority}</span>
                <span className="font-mono text-[10px] text-slate-600">{inc.id} · {inc.source}</span>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-slate-100">{inc.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{inc.description}</p>
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-900/60 p-2.5">
                <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" />
                <p className="text-[11px] leading-relaxed text-slate-300">{inc.action}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
