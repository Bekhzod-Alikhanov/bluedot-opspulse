"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock, MapPin, Star, Send, Check, Clock4, Globe2, Sparkles, Loader2,
} from "lucide-react";
import type { BackupFacilitator } from "@/lib/types";
import { assignBackup } from "@/lib/actions";

const SHIFTS = [
  { key: "thu-18", label: "Thursday 6-8pm UK", cohortCode: "C10", reason: "Tom Reeves — flu cover" },
  { key: "fri-16", label: "Friday 4-6pm UK", cohortCode: "C11", reason: "Jamie Whitford — suspended pending review" },
];

const isMatch = (b: BackupFacilitator) => b.is_uk && b.status === "Available";

export default function BackupMatcher({ backups }: { backups: BackupFacilitator[] }) {
  const router = useRouter();
  const [shiftKey, setShiftKey] = useState(SHIFTS[0].key);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const gap = SHIFTS.find((s) => s.key === shiftKey) ?? SHIFTS[0];

  const ranked = [...backups].sort((a, b) => {
    const am = isMatch(a) ? 0 : 1, bm = isMatch(b) ? 0 : 1;
    return am !== bm ? am - bm : b.rating - a.rating;
  });
  const matchCount = backups.filter(isMatch).length;

  const assign = (b: BackupFacilitator) => {
    setPendingId(b.id);
    startTransition(async () => {
      const res = await assignBackup(b, gap.key, gap.label, gap.cohortCode);
      if (res?.ics) {
        const blob = new Blob([res.ics], { type: "text/calendar" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = res.icsName || "cover.ics"; a.click();
        URL.revokeObjectURL(url);
      }
      const mode = res?.slack?.demoMode ? " (Slack simulated)" : " (Slack sent)";
      setToast(`${b.name} booked for ${gap.label} at £${b.cost_per_session}.${mode} Calendar hold downloaded.`);
      router.refresh();
      setPendingId(null);
      setTimeout(() => setToast(null), 5000);
    });
  };

  return (
    <div className="space-y-6">
      <header className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">Backup Matcher</h1>
        <p className="mt-1 text-sm text-slate-400">Clear the two open facilitator gaps. Pick a shift to filter the pool by timezone and availability, then book at the £80 rate.</p>
      </header>

      <div className="panel animate-fade-up rounded-2xl p-5">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-500"><CalendarClock className="h-3.5 w-3.5" /> Target shift</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          {SHIFTS.map((g) => {
            const active = g.key === shiftKey;
            return (
              <button key={g.key} onClick={() => setShiftKey(g.key)} className={`flex-1 rounded-xl border p-4 text-left transition ${active ? "border-signal/50 bg-signal/10 ring-1 ring-signal/30" : "border-slate-800 bg-slate-900/40 hover:border-slate-700"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-slate-100">{g.label}</span>
                  <span className={`font-mono text-[10px] ${active ? "text-signal" : "text-slate-600"}`}>{g.cohortCode}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{g.reason}</p>
              </button>
            );
          })}
        </div>
        <p className="mt-3 font-mono text-[11px] text-slate-500">{matchCount} facilitator{matchCount === 1 ? "" : "s"} match <span className="text-slate-300">{gap.label}</span> — UK timezone &amp; available.</p>
      </div>

      <div className="space-y-3">
        {ranked.map((b, idx) => {
          const matched = isMatch(b);
          const busy = pendingId === b.id;
          const reasonOut = !b.is_uk ? `${b.timezone} — outside UK window` : b.status === "Busy" ? "Currently busy" : "Unavailable";
          return (
            <div key={b.id} style={{ animationDelay: `${idx * 40}ms` }} className={`panel animate-fade-up flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between ${matched ? "ring-1 ring-signal/40" : "opacity-70"}`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold ${matched ? "bg-signal/15 text-signal ring-1 ring-signal/40" : "bg-slate-800 text-slate-400"}`}>
                  {b.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-100">{b.name}</p>
                    <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${b.role === "Teaching Fellow" ? "bg-violet-500/15 text-violet-300" : "bg-slate-800 text-slate-400"}`}>{b.role}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {b.location}</span>
                    <span className="flex items-center gap-1"><Globe2 className="h-3 w-3" /> {b.timezone}</span>
                    <span className="flex items-center gap-1 text-amber-300"><Star className="h-3 w-3 fill-amber-300" /> {b.rating}</span>
                  </div>
                  <p className="mt-1 max-w-md text-[11px] text-slate-500">{b.specialties}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                <span className="font-mono text-sm font-semibold text-slate-200">£{b.cost_per_session}<span className="text-[10px] text-slate-500">/session</span></span>
                {b.status === "Busy" ? (
                  <span className="flex items-center gap-1.5 rounded-lg bg-slate-800/70 px-3 py-2 font-mono text-[11px] text-slate-400"><Clock4 className="h-3.5 w-3.5" /> Busy</span>
                ) : matched ? (
                  <button onClick={() => assign(b)} disabled={busy} className="flex items-center gap-1.5 rounded-lg bg-signal px-3.5 py-2 text-[13px] font-semibold text-slate-950 transition hover:bg-signal-soft disabled:opacity-60">
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Assign &amp; Send Slack Alert
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-lg border border-slate-800 px-3 py-2 font-mono text-[10px] text-slate-500">{reasonOut}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="panel flex items-start gap-3 rounded-xl p-4">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
        <p className="text-xs leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-200">Escalation path:</span> two Teaching Fellows (£120) can cover at short notice, but pulling them stalls cohort-design work. Prefer the £80 backups; reserve Fellows for a genuine no-show.
        </p>
      </div>

      {toast && (
        <div role="status" aria-live="polite" className="panel fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-xl border-emerald-500/30 p-4 shadow-2xl animate-slide-in">
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <p className="text-xs leading-relaxed text-slate-200">{toast}</p>
        </div>
      )}
    </div>
  );
}
