"use client";

import { TrendingDown } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell,
} from "recharts";
import type { Cohort } from "@/lib/types";

const COHORT_LINES = [
  { key: "C7", color: "#475569", width: 1.5, dim: true },
  { key: "C8", color: "#64748b", width: 1.5, dim: true },
  { key: "C9", color: "#34d399", width: 2, dim: false },
  { key: "C10", color: "#fbbf24", width: 2, dim: false },
  { key: "C11", color: "#fb7185", width: 3, dim: false },
  { key: "C12", color: "#c084fc", width: 2, dim: false },
];

function tip() {
  return {
    background: "rgba(8,12,22,0.96)", border: "1px solid #1e293b", borderRadius: "10px",
    fontSize: "12px", fontFamily: "var(--font-plex-mono)", color: "#e2e8f0",
  };
}

export default function Charts({ cohorts }: { cohorts: Cohort[] }) {
  const weeks = ["w1", "w2", "w3", "w4"] as const;
  const pulseData = weeks.map((wk, i) => {
    const row: Record<string, number | string | null> = { week: `W${i + 1}` };
    cohorts.forEach((c) => (row[c.code] = c.pulse[wk]));
    return row;
  });
  const onboardingData = cohorts.map((c) => ({
    code: c.code, delivery: c.email_delivery_pct, transfers: c.transfer_requests, failed: c.email_delivery_pct === 0,
  }));

  return (
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
        <div className="mt-4 h-[260px]" role="img" aria-label="Line chart of pulse survey scores by week for all six cohorts. Cohort 11 falls from 4.5 to 2.1 by week 3.">
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
        <div className="mt-4 h-[260px]" role="img" aria-label="Bar chart comparing welcome-email delivery percentage against transfer-request counts per cohort. Cohort 12 shows 0 percent delivery and 5 transfer requests.">
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
  );
}
