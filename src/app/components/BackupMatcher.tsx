"use client";

import { useState } from "react";
import {
  CalendarClock,
  MapPin,
  Star,
  Send,
  Check,
  Clock4,
  Globe2,
  Sparkles,
} from "lucide-react";
import {
  shiftGaps,
  type BackupFacilitator,
  type ShiftGap,
} from "../data/mockData";
import type { OpsState } from "../page";

interface BackupMatcherProps {
  state: OpsState;
  onAssign: (backup: BackupFacilitator, gap: ShiftGap) => void;
}

function isMatch(b: BackupFacilitator) {
  // UK-timezone evening cover that is free to take a session now.
  return b.isUK && b.status === "Available";
}

export default function BackupMatcher({ state, onAssign }: BackupMatcherProps) {
  const { backups } = state;
  const [shiftKey, setShiftKey] = useState<string>(shiftGaps[0].key);
  const gap = shiftGaps.find((g) => g.key === shiftKey) ?? shiftGaps[0];

  // Matching facilitators first, then the rest.
  const ranked = [...backups].sort((a, b) => {
    const am = isMatch(a) ? 0 : 1;
    const bm = isMatch(b) ? 0 : 1;
    if (am !== bm) return am - bm;
    return b.rating - a.rating;
  });

  const matchCount = backups.filter(isMatch).length;

  return (
    <div className="space-y-6">
      <header className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">
          Backup Matcher
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Clear the two open facilitator gaps. Pick a shift to filter the pool by
          timezone and availability, then book at the £80 backup rate.
        </p>
      </header>

      {/* Shift selector */}
      <div className="panel animate-fade-up rounded-2xl p-5">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
          <CalendarClock className="h-3.5 w-3.5" /> Target shift
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          {shiftGaps.map((g) => {
            const active = g.key === shiftKey;
            return (
              <button
                key={g.key}
                onClick={() => setShiftKey(g.key)}
                className={`flex-1 rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-signal/50 bg-signal/10 ring-1 ring-signal/30"
                    : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-slate-100">
                    {g.label}
                  </span>
                  <span
                    className={`font-mono text-[10px] ${
                      active ? "text-signal" : "text-slate-600"
                    }`}
                  >
                    {g.cohortCode}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{g.reason}</p>
              </button>
            );
          })}
        </div>
        <p className="mt-3 font-mono text-[11px] text-slate-500">
          {matchCount} facilitator{matchCount === 1 ? "" : "s"} match{" "}
          <span className="text-slate-300">{gap.label}</span> — UK timezone &amp;
          available for an evening session.
        </p>
      </div>

      {/* Pool */}
      <div className="space-y-3">
        {ranked.map((b, idx) => {
          const matched = isMatch(b);
          const reasonOut = !b.isUK
            ? `${b.timezone} — outside UK evening window`
            : b.status === "Busy"
            ? "Currently assigned / busy"
            : "Unavailable";
          return (
            <div
              key={b.id}
              style={{ animationDelay: `${idx * 40}ms` }}
              className={`panel animate-fade-up flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between ${
                matched ? "ring-1 ring-signal/40" : "opacity-70"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold ${
                    matched
                      ? "bg-signal/15 text-signal ring-1 ring-signal/40"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {b.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-100">{b.name}</p>
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                        b.role === "Teaching Fellow"
                          ? "bg-violet-500/15 text-violet-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {b.role}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {b.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe2 className="h-3 w-3" /> {b.timezone}
                    </span>
                    <span className="flex items-center gap-1 text-amber-300">
                      <Star className="h-3 w-3 fill-amber-300" /> {b.rating}
                    </span>
                  </div>
                  <p className="mt-1 max-w-md text-[11px] text-slate-500">
                    {b.specialties}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                <span className="font-mono text-sm font-semibold text-slate-200">
                  £{b.costPerSession}
                  <span className="text-[10px] text-slate-500">/session</span>
                </span>
                {b.status === "Busy" ? (
                  <span className="flex items-center gap-1.5 rounded-lg bg-slate-800/70 px-3 py-2 font-mono text-[11px] text-slate-400">
                    <Clock4 className="h-3.5 w-3.5" /> Busy
                  </span>
                ) : matched ? (
                  <button
                    onClick={() => onAssign(b, gap)}
                    className="flex items-center gap-1.5 rounded-lg bg-signal px-3.5 py-2 text-[13px] font-semibold text-slate-950 transition hover:bg-signal-soft"
                  >
                    <Send className="h-3.5 w-3.5" /> Assign &amp; Send Slack Alert
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-lg border border-slate-800 px-3 py-2 font-mono text-[10px] text-slate-500">
                    {reasonOut}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reserve note */}
      <div className="panel flex items-start gap-3 rounded-xl p-4">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
        <p className="text-xs leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-200">Escalation path:</span>{" "}
          two Teaching Fellows (£120) can cover at short notice, but pulling them
          stalls cohort-design work. Prefer the £80 backups; reserve Fellows for a
          genuine no-show. If both gaps land on the same evening, book the backup
          for cover and brief from the outgoing facilitator.
        </p>
      </div>

      {/* Assigned summary */}
      {backups.some((b) => b.status === "Busy" && b.isUK) && (
        <div className="panel flex items-center gap-2 rounded-xl border-emerald-500/30 p-4">
          <Check className="h-4 w-4 text-emerald-400" />
          <p className="text-xs text-slate-300">
            Assignments confirmed this session. Slack alerts dispatched to{" "}
            <span className="font-mono text-emerald-300">#ops-facilitators</span>{" "}
            with the handover checklist.
          </p>
        </div>
      )}
    </div>
  );
}
