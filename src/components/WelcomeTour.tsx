"use client";

import { useCallback, useEffect, useState } from "react";
import { Radar, Inbox, BellRing, BarChart3, HelpCircle, X, ArrowRight, ArrowLeft } from "lucide-react";
import { useEscape } from "@/components/hooks/useEscape";

const KEY = "opspulse-tour-v1";

const STEPS = [
  {
    icon: Radar,
    title: "It's 9am Monday in London",
    body: "You're the Course Operations Lead for the Technical AI Safety course. The course lead is away, and a weekend's worth of escalations, a facilitator emergency, and a 10x invoice have piled up. OpsPulse opens with the Monday Decision Brief: what matters, why, who owns it, and what happens next.",
  },
  {
    icon: Inbox,
    title: "Triage Queue",
    body: "One ranked inbox for the whole pile: priority x SLA, live countdown timers, one-click resolve, notes, and snooze. Open any item for full context and its audit history.",
  },
  {
    icon: BellRing,
    title: "Systemic fix is shipped",
    body: "Prevention, not just firefighting. The Systemic Fix page turns the Monday Course Health Sweep into a reusable checklist, and Monitors & Alerts shows the signals it should catch before next Monday.",
  },
  {
    icon: BarChart3,
    title: "Two roles, two views",
    body: "Sign in as Ops Lead for triage, shipped drafts, finance, backup, and the health sweep. Management gets the leadership cockpit with trends, cost, predictive risk, and the Monday digest. Slack/email actions are simulated in this demo.",
  },
];

export default function WelcomeTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const close = useCallback(() => {
    setOpen(false);
    setStep(0);
    if (typeof window !== "undefined") localStorage.setItem(KEY, "1");
  }, []);

  useEscape(open, close);

  useEffect(() => {
    if (typeof window === "undefined" || localStorage.getItem(KEY)) return;
    const id = window.setTimeout(() => setOpen(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const replay = () => {
    setStep(0);
    setOpen(true);
  };

  return (
    <>
      {/* Floating help button to replay the tour */}
      <button
        onClick={replay}
        aria-label="Replay the welcome tour"
        title="What is this?"
        className="fixed bottom-5 left-5 z-30 hidden h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-300 shadow-lg backdrop-blur transition hover:border-signal/50 hover:text-signal sm:flex lg:bottom-6 lg:left-6"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={close} aria-hidden="true" />
          <div role="dialog" aria-modal="true" aria-label="Welcome tour" className="panel relative w-full max-w-md animate-fade-up rounded-2xl p-6">
            <button onClick={close} aria-label="Close tour" className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200">
              <X className="h-4 w-4" />
            </button>

            {(() => {
              const Icon = STEPS[step].icon;
              return (
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-signal/15 ring-1 ring-signal/40">
                  <Icon className="h-5 w-5 text-signal" />
                </div>
              );
            })()}

            <h2 className="mt-4 text-lg font-bold text-slate-50">{STEPS[step].title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{STEPS[step].body}</p>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-signal" : "w-1.5 bg-slate-700"}`} />
                ))}
              </div>
              <div className="flex gap-2">
                {step > 0 && (
                  <button onClick={() => setStep((s) => s - 1)} className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                )}
                {step < STEPS.length - 1 ? (
                  <button onClick={() => setStep((s) => s + 1)} className="flex items-center gap-1 rounded-lg bg-signal px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-signal-soft">
                    Next <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button onClick={close} className="rounded-lg bg-signal px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-signal-soft">
                    Start triaging
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
