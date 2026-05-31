"use client";

import {
  Radar,
  LayoutGrid,
  CalendarClock,
  ReceiptText,
  Activity,
  Plane,
} from "lucide-react";
import { SYSTEM } from "../data/mockData";

export type ViewKey = "control" | "triage" | "backup" | "finance";

interface NavItem {
  key: ViewKey;
  label: string;
  sub: string;
  icon: typeof Radar;
}

const NAV: NavItem[] = [
  { key: "control", label: "Control Room", sub: "Dashboard", icon: Radar },
  { key: "triage", label: "Cohort Triage", sub: "6 cohorts", icon: LayoutGrid },
  { key: "backup", label: "Backup Matcher", sub: "Scheduling", icon: CalendarClock },
  { key: "finance", label: "Financial Hygiene", sub: "Invoice audit", icon: ReceiptText },
];

interface SidebarProps {
  activeView: ViewKey;
  onNavigate: (v: ViewKey) => void;
  systemHealth: number;
  criticalAlerts: number;
}

function healthTone(health: number) {
  if (health >= 85)
    return {
      ring: "border-emerald-500/40",
      text: "text-emerald-300",
      bar: "bg-emerald-400",
      label: "Nominal",
    };
  if (health >= 60)
    return {
      ring: "border-amber-500/40",
      text: "text-amber-300",
      bar: "bg-amber-400",
      label: "Action Required",
    };
  return {
    ring: "border-rose-500/40",
    text: "text-rose-300",
    bar: "bg-rose-400",
    label: "Critical",
  };
}

export default function Sidebar({
  activeView,
  onNavigate,
  systemHealth,
  criticalAlerts,
}: SidebarProps) {
  const tone = healthTone(systemHealth);

  return (
    <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 flex-col border-r border-slate-800/80 bg-slate-950/40 px-5 py-6 backdrop-blur-md lg:flex">
      {/* Brand */}
      <div className="mb-6 flex items-center gap-3 px-1">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-signal/15 ring-1 ring-signal/40">
          <span className="absolute h-2 w-2 rounded-full bg-signal" />
          <span className="absolute h-2 w-2 animate-pulse-ring rounded-full bg-signal" />
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-bold tracking-tight text-slate-50">
            OpsPulse
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
            BlueDot · Control Room
          </p>
        </div>
      </div>

      {/* System health badge */}
      <div className={`mb-6 rounded-xl border bg-slate-900/50 p-4 ${tone.ring}`}>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-400">
            <Activity className="h-3 w-3" /> System Health
          </span>
          <span className={`font-mono text-[10px] font-semibold uppercase tracking-wider ${tone.text}`}>
            {tone.label}
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className={`tabular font-mono text-3xl font-bold ${tone.text}`}>
            {systemHealth}
          </span>
          <span className="font-mono text-sm text-slate-500">%</span>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full ${tone.bar} transition-all duration-700 ease-out`}
            style={{ width: `${systemHealth}%` }}
          />
        </div>
        <p className="mt-2.5 font-mono text-[11px] text-slate-500">
          {criticalAlerts} critical {criticalAlerts === 1 ? "alert" : "alerts"} open
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = activeView === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                active
                  ? "bg-slate-800/70 text-slate-50 ring-1 ring-slate-700"
                  : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] ${
                  active ? "text-signal" : "text-slate-500 group-hover:text-slate-300"
                }`}
              />
              <span className="flex-1">
                <span className="block text-sm font-medium leading-tight">
                  {item.label}
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-600">
                  {item.sub}
                </span>
              </span>
              {active && <span className="h-1.5 w-1.5 rounded-full bg-signal" />}
            </button>
          );
        })}
      </nav>

      {/* Footer context */}
      <div className="mt-auto space-y-3 border-t border-slate-800/80 pt-4">
        <div className="rounded-lg bg-slate-900/40 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Active Round
          </p>
          <p className="mt-1 text-sm text-slate-300">
            {SYSTEM.course}
          </p>
          <p className="font-mono text-[11px] text-slate-500">
            Round {SYSTEM.round} · Week {SYSTEM.week}/{SYSTEM.totalWeeks} ·{" "}
            {SYSTEM.totalStudents} learners
          </p>
        </div>
        <div className="flex items-start gap-2 px-1">
          <Plane className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />
          <p className="font-mono text-[10px] leading-relaxed text-slate-600">
            Lead away — full authority on day-to-day calls. {SYSTEM.leadAway}.
          </p>
        </div>
      </div>
    </aside>
  );
}
