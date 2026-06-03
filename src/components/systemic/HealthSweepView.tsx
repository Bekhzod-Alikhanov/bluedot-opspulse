import { AlertTriangle, CheckCircle2, ClipboardCheck, Flag, ListChecks, Zap } from "lucide-react";
import {
  automationFailureRunbook,
  ragRules,
  sweepChecks,
  sweepDefinitionOfDone,
} from "@/lib/workTestBrief";

const RAG_STYLE: Record<string, string> = {
  Green: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  Amber: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  Red: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
};

export default function HealthSweepView() {
  return (
    <div className="space-y-6">
      <header className="animate-fade-up">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
          <ClipboardCheck className="h-3.5 w-3.5 text-signal" /> Part 3 artifact
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-50">Monday Course Health Sweep</h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-400">
          A 35-40 minute Monday 09:00 checklist for whoever covers course operations. It joins inbox, Slack, pulse,
          automation, admissions, and billing signals before ordinary queue clearing begins.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="panel animate-fade-up rounded-2xl p-5 xl:col-span-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <ListChecks className="h-4 w-4 text-signal" /> Definition of Done by 09:45
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {sweepDefinitionOfDone.map((line) => (
              <div key={line} className="flex items-start gap-2 rounded-lg bg-slate-900/55 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <p className="text-xs leading-relaxed text-slate-300">{line}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel animate-fade-up rounded-2xl p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Flag className="h-4 w-4 text-rose-300" /> RAG Rules
          </h2>
          <div className="mt-4 space-y-2">
            {ragRules.map((rule) => (
              <div key={rule.label} className="rounded-lg bg-slate-900/55 p-3">
                <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ring-1 ${RAG_STYLE[rule.label]}`}>
                  {rule.label}
                </span>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{rule.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel animate-fade-up overflow-hidden rounded-2xl">
        <div className="border-b border-slate-800/80 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <AlertTriangle className="h-4 w-4 text-amber-300" /> Sweep Checklist
          </h2>
          <p className="mt-1 text-xs text-slate-500">Run these before normal inbox clearing; red flags create owned incidents.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-950/40 font-mono text-[10px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="w-56 px-4 py-2.5">Check</th>
                <th className="px-4 py-2.5">Red flag</th>
                <th className="px-4 py-2.5">Action</th>
                <th className="w-56 px-4 py-2.5">This Monday</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {sweepChecks.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="px-4 py-3 font-semibold text-slate-100">{row.check}</td>
                  <td className="px-4 py-3 text-xs leading-relaxed text-slate-400">{row.redFlag}</td>
                  <td className="px-4 py-3 text-xs leading-relaxed text-slate-300">{row.action}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel animate-fade-up rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Zap className="h-4 w-4 text-signal" /> Automation Failure Runbook
        </h2>
        <ol className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-5">
          {automationFailureRunbook.map((step, i) => (
            <li key={step} className="rounded-lg bg-slate-900/55 p-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-signal">Step {i + 1}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
