"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { signOut } from "@/app/login/actions";
import type { Role } from "@/lib/types";
import { navFor, healthTone } from "@/components/nav/navItems";
import { useEscape } from "@/components/hooks/useEscape";

export default function MobileNav({
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
  const [open, setOpen] = useState(false);
  const tone = healthTone(systemHealth);
  const items = navFor(role);
  useEscape(open, () => setOpen(false));

  return (
    <div className="lg:hidden">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/85 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-md bg-signal/15 ring-1 ring-signal/40">
            <span className="absolute h-1.5 w-1.5 rounded-full bg-signal" />
            <span className="absolute h-1.5 w-1.5 animate-pulse-ring rounded-full bg-signal" />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-50">OpsPulse</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-baseline gap-0.5 font-mono text-sm font-bold ${tone.text}`}>
            {systemHealth}<span className="text-[10px] text-slate-500">%</span>
          </span>
          <button onClick={() => setOpen(true)} className="rounded-lg border border-slate-800 bg-slate-900/60 p-1.5 text-slate-300" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
          <div role="dialog" aria-modal="true" aria-label="Navigation menu" className="absolute right-0 top-0 flex h-full w-[280px] animate-drawer-in flex-col border-l border-slate-800 bg-slate-950 px-5 py-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="leading-tight">
                <p className="text-sm font-bold text-slate-50">OpsPulse</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">BlueDot · {role === "management" ? "Leadership" : "Operations"}</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className={`mb-5 rounded-xl border bg-slate-900/50 p-3 ${tone.ring}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">System Health</span>
                <span className={`font-mono text-[10px] font-semibold uppercase ${tone.text}`}>{tone.label}</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`font-mono text-2xl font-bold ${tone.text}`}>{systemHealth}</span>
                <span className="font-mono text-xs text-slate-500">%</span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-slate-500">{criticalAlerts} P0/P1 open</p>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
              {items.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition ${active ? "bg-slate-800/70 text-slate-50 ring-1 ring-slate-700" : "text-slate-400 hover:bg-slate-900/60"}`}>
                    <Icon className={`h-[18px] w-[18px] ${active ? "text-signal" : "text-slate-500"}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-300">{name}</p>
                <p className="truncate font-mono text-[10px] text-slate-600">{email}</p>
              </div>
              <form action={signOut}>
                <button className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800 hover:text-rose-300" title="Sign out" aria-label="Sign out"><LogOut className="h-4 w-4" /></button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
