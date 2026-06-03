"use client";

import { useState } from "react";
import { Check, Copy, FileText, MailCheck } from "lucide-react";
import { shippedDrafts, type DraftReadiness, type ShippedDraft } from "@/lib/workTestBrief";

const READINESS_STYLE: Record<DraftReadiness, string> = {
  "Ready to send": "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  "Needs fact check": "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  "Needs leadership input": "bg-violet-500/15 text-violet-300 ring-violet-500/30",
};

function draftText(draft: ShippedDraft) {
  return `${draft.subject}\n\n${draft.body}`;
}

export default function TemplatesView() {
  const [openId, setOpenId] = useState<string | null>(shippedDrafts[0]?.id ?? null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = async (draft: ShippedDraft) => {
    try {
      await navigator.clipboard.writeText(draftText(draft));
      setCopiedId(draft.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Clipboard can fail in restricted preview contexts; the visible text remains selectable.
    }
  };

  return (
    <div className="space-y-6">
      <header className="animate-fade-up">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
          <MailCheck className="h-3.5 w-3.5 text-signal" /> Part 2 artifact
        </div>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-50">
          <FileText className="h-6 w-6 text-signal" /> Drafts Shipped
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-400">
          The actual comms that follow from the triage plan: participant care, facilitator review, press holding line, cohort recovery,
          cover logistics, and quick operational clears. Each draft shows who it goes to, when it is due, and whether it is ready or needs input.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {shippedDrafts.map((draft, i) => {
          const open = openId === draft.id;
          return (
            <article
              key={draft.id}
              style={{ animationDelay: `${i * 35}ms` }}
              className={`panel animate-fade-up rounded-xl p-4 ${open ? "ring-1 ring-signal/35" : ""}`}
            >
              <button onClick={() => setOpenId(open ? null : draft.id)} className="w-full text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-400">
                    {draft.category}
                  </span>
                  <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ring-1 ${READINESS_STYLE[draft.readiness]}`}>
                    {draft.readiness}
                  </span>
                </div>
                <h2 className="mt-2 text-sm font-semibold text-slate-100">{draft.recipient}</h2>
                <p className="mt-0.5 font-mono text-[11px] text-slate-500">{draft.channel} - {draft.deadline}</p>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">{draft.subject}</p>
              </button>

              {open && (
                <div className="mt-3">
                  <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950/60 p-3 font-mono text-[11.5px] leading-relaxed text-slate-300">
                    {draft.body}
                  </pre>
                  <button
                    onClick={() => copy(draft)}
                    className="mt-3 flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 font-mono text-[11px] text-slate-300 transition hover:border-slate-600 hover:text-slate-100"
                  >
                    {copiedId === draft.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy draft
                      </>
                    )}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
