"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Users, Gauge, Siren, ReceiptText, ArrowUpRight, Radio } from "lucide-react";
import type { Cohort, Incident, Alert, Priority } from "@/lib/types";
import { SYSTEM } from "@/lib/types";
import { computeHealth, criticalCount, pendingInvoices, rankIncidents } from "@/lib/sla";

// Recharts is heavy — load it after first paint so the KPIs + feed render fast.
const Charts = dynamic(() => import("./Charts"), {
  ssr: false,
  loading: () => (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
      <div className="panel h-[340px] animate-pulse rounded-2xl xl:col-span-3" />
      <div className="panel h-[340px] animate-pulse rounded-2xl xl:col-span-2" />
    </section>
  ),
});

const PRIORITY_STYLE: Record<Priority, string> = {
  P0: "bg-rose-500/15 text-rose-300 ring-rose-500/40",
  P1: "bg-amber-500/15 text-amber-300 ring-amber-500/40",
  P2: "bg-sky-500/15 text-sky-300 ring-sky-500/40",
};

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

  const feed = rankIncidents(incidents)
    .filter((i) => i.status === "Open" && (i.priority === "P0" || i.priority === "P1"))
    .slice(0, 6);

  const kpis = [
    { label: "Active Learners", value: SYSTEM.totalStudents, sub: `${SYSTEM.totalCohorts} cohorts · Round ${SYSTEM.round}`, icon: Users, tone: "text-sky-300", ring: "ring-sky-500/20" },
    { label: "System Health Index", value: `${health}%`, sub: health >= 85 ? "Nominal" : "Below target — action required", icon: Gauge, tone: health >= 85 ? "text-emerald-300" : "text-amber-300", ring: health >= 85 ? "ring-emerald-500/20" : "ring-amber-500/20" },
    { label: "Active Critical Alerts", value: critical, sub: "Open P0 + P1 incidents", icon: Siren, tone: critical > 0 ? "text-rose-300" : "text-emerald-300", ring: critical > 0 ? "ring-rose-500/20" : "ring-emerald-500/20" },
    { label: "Pending Invoices", value: pending, sub: pending > 0 ? "Anomaly awaiting sign-off" : "Cleared", icon: ReceiptText, tone: pending > 0 ? "text-amber-300" : "text-emerald-300", ring: pending > 0 ? "ring-amber-500/20" : "ring-emerald-500/20" },
  ];

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

      <Charts cohorts={cohorts} />

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
