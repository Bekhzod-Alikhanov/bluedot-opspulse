"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LogOut, Plane } from "lucide-react";
import { signOut } from "@/app/login/actions";
import type { Role } from "@/lib/types";
import { SYSTEM } from "@/lib/types";
import { navFor, healthTone } from "@/components/nav/navItems";

export default function Sidebar({
  role,
  name,
  email,
  systemHealth,
  criticalAlerts,
}: {
  role: Role;
  name: string;
  email: string;
  systemHealth: number;
  criticalAlerts: number;
}) {
  const pathname = usePathname();
  const tone = healthTone(systemHealth);
  const items = navFor(role);

  return (
    <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 flex-col border-r border-slate-800/80 bg-slate-950/40 px-5 py-6 backdrop-blur-md lg:flex">
      <div className="mb-6 flex items-center gap-3 px-1">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-signal/15 ring-1 ring-signal/40">
          <span className="absolute h-2 w-2 rounded-full bg-signal" />
          <span className="absolute h-2 w-2 animate-pulse-ring rounded-full bg-signal" />
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-bold tracking-tight text-slate-50">OpsPulse</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
            BlueDot · {role === "management" ? "Leadership" : "Operations"}
          </p>
        </div>
      </div>

      <div className={`mb-6 rounded-xl border bg-slate-900/50 p-4 ${tone.ring}`}>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-400">
            <Activity className="h-3 w-3" /> System Health
          </span>
          <span className={`font-mono text-[10px] font-semibold uppercase tracking-wider ${tone.text}`}>{tone.label}</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className={`tabular font-mono text-3xl font-bold ${tone.text}`}>{systemHealth}</span>
          <span className="font-mono text-sm text-slate-500">%</span>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div className={`h-full rounded-full ${tone.bar} transition-all duration-700`} style={{ width: `${systemHealth}%` }} />
        </div>
        <p className="mt-2.5 font-mono text-[11px] text-slate-500">
          {criticalAlerts} critical {criticalAlerts === 1 ? "alert" : "alerts"} open
        </p>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition ${
                active ? "bg-slate-800/70 text-slate-50 ring-1 ring-slate-700" : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] ${active ? "text-signal" : "text-slate-500 group-hover:text-slate-300"}`} />
              <span className="flex-1">
                <span className="block text-sm font-medium leading-tight">{item.label}</span>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-600">{item.sub}</span>
              </span>
              {active && <span className="h-1.5 w-1.5 rounded-full bg-signal" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 border-t border-slate-800/80 pt-4">
        <div className="flex items-start gap-2 px-1">
          <Plane className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />
          <p className="font-mono text-[10px] leading-relaxed text-slate-600">
            {SYSTEM.course} · R{SYSTEM.round} W{SYSTEM.week}. {SYSTEM.leadAway}.
          </p>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-900/40 p-2.5">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-300">{name}</p>
            <p className="truncate font-mono text-[10px] text-slate-600">{email}</p>
          </div>
          <form action={signOut}>
            <button className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-rose-300" title="Sign out" aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
