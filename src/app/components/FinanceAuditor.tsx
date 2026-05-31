"use client";

import { useState } from "react";
import {
  ReceiptText,
  TrendingUp,
  Search,
  Copy,
  Check,
  ShieldX,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { invoiceAudit, SYSTEM } from "../data/mockData";
import type { OpsState } from "../page";

interface FinanceAuditorProps {
  state: OpsState;
  onHalt: () => void;
}

const ESCALATION_TEMPLATE = `Hi Li-Lian,

Flagging a finance anomaly before it auto-pays. I've halted the payment in the meantime — no money has moved.

Notion Enterprise renewal (invoice ${invoiceAudit.invoiceNo}) came in at $48,000 vs $4,800 last year — a 10x jump with no explanation in the email body.

Root cause (from our audit): an unmonitored domain-capture setting auto-provisioned ~215 premium Enterprise seats for external R4 applicants who signed up with addresses on our verified domains. Only ~32 are genuine team seats.

What I've done:
- Halted auto-pay on invoice ${invoiceAudit.invoiceNo}.
- Disabled domain capture in the Notion admin console.
- Drafted a reclaim request for the 215 phantom seats.

What I need from you:
- A quick sign-off to request a corrected invoice (~$4,800-6,000) from Notion billing.
- A steer on whether Finance wants to own the vendor-side conversation or leave it with Ops.

Not urgent enough to interrupt your day, but it needs a decision before the payment window closes Thursday. Happy to jump on a 10-min call.

Thanks,
Course Operations`;

export default function FinanceAuditor({ state, onHalt }: FinanceAuditorProps) {
  const { invoiceHalted } = state;
  const [copied, setCopied] = useState(false);

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(ESCALATION_TEMPLATE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">
          Financial Hygiene
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          One invoice tripped the anomaly threshold. Audit the jump, halt the
          payment, and escalate with a recommendation — before auto-pay fires.
        </p>
      </header>

      {/* Comparison */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="panel animate-fade-up rounded-2xl p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Last year
          </p>
          <p className="tabular mt-3 font-mono text-3xl font-bold text-slate-200">
            ${invoiceAudit.lastYear.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">{invoiceAudit.vendor} renewal</p>
        </div>

        <div className="panel crit-glow animate-fade-up rounded-2xl p-5">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-rose-300">
            <AlertTriangle className="h-3 w-3" /> This year
          </p>
          <p className="tabular mt-3 font-mono text-3xl font-bold text-rose-300">
            ${invoiceAudit.thisYear.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Invoice {invoiceAudit.invoiceNo} · auto-pay{" "}
            {invoiceHalted ? (
              <span className="text-emerald-300">halted</span>
            ) : (
              <span className="text-amber-300">armed</span>
            )}
          </p>
        </div>

        <div className="panel animate-fade-up rounded-2xl p-5">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            <TrendingUp className="h-3 w-3" /> Variance
          </p>
          <p className="tabular mt-3 font-mono text-3xl font-bold text-amber-300">
            {invoiceAudit.multiplier}&times;
          </p>
          <p className="mt-1 text-xs text-slate-500">
            +${invoiceAudit.delta.toLocaleString()} unexplained
          </p>
        </div>
      </section>

      {/* Root-cause analysis */}
      <section className="panel animate-fade-up rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-sky-500/10 p-1.5 ring-1 ring-sky-500/30">
            <Search className="h-4 w-4 text-sky-300" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-200">
              Automated Root-Cause Analysis
            </h2>
            <p className="font-mono text-[11px] text-slate-500">
              Seat-level reconciliation · Notion admin export
            </p>
          </div>
        </div>

        <p
          className="mt-4 rounded-lg bg-slate-900/60 p-3 text-sm leading-relaxed text-slate-300"
          dangerouslySetInnerHTML={{ __html: invoiceAudit.rootCause }}
        />

        {/* Breakdown table */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/70 font-mono text-[10px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Line item</th>
                <th className="px-4 py-2.5 text-right">Seats</th>
                <th className="px-4 py-2.5 text-right">Unit</th>
                <th className="px-4 py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {invoiceAudit.breakdown.map((row) => {
                const flagged = row.seats === 215;
                return (
                  <tr
                    key={row.label}
                    className={flagged ? "bg-rose-500/5" : ""}
                  >
                    <td className="px-4 py-3 text-slate-300">
                      {flagged && (
                        <span className="mr-2 inline-block rounded bg-rose-500/15 px-1.5 py-0.5 font-mono text-[9px] uppercase text-rose-300">
                          phantom
                        </span>
                      )}
                      {row.label}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-400">
                      {row.seats || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-400">
                      {row.unit ? `$${row.unit}` : "—"}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono ${
                        flagged ? "text-rose-300" : "text-slate-300"
                      }`}
                    >
                      ${row.amount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-slate-900/50 font-semibold">
                <td className="px-4 py-3 text-slate-200">Total billed</td>
                <td className="px-4 py-3 text-right font-mono text-slate-400">
                  247
                </td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right font-mono text-rose-300">
                  ${invoiceAudit.thisYear.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <ShieldX className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
          <p className="text-xs leading-relaxed text-slate-300">
            <span className="font-semibold text-emerald-200">Recommendation:</span>{" "}
            {invoiceAudit.recommendation}
          </p>
        </div>
      </section>

      {/* Escalation + halt */}
      <section className="panel animate-fade-up rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4 text-signal" />
            <h2 className="text-sm font-semibold text-slate-200">
              Escalation to {SYSTEM.escalationContacts[0]}
            </h2>
          </div>
          <button
            onClick={copyTemplate}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 font-mono text-[11px] text-slate-300 transition hover:border-slate-600 hover:text-slate-100"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy message
              </>
            )}
          </button>
        </div>

        <pre className="mt-3 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950/60 p-4 font-mono text-[12px] leading-relaxed text-slate-300">
          {ESCALATION_TEMPLATE}
        </pre>

        <button
          onClick={onHalt}
          disabled={invoiceHalted}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
            invoiceHalted
              ? "cursor-not-allowed bg-emerald-500/15 text-emerald-300"
              : "bg-signal text-slate-950 hover:bg-signal-soft"
          }`}
        >
          {invoiceHalted ? (
            <>
              <Check className="h-4 w-4" /> Auto-pay halted · escalation sent
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" /> Escalate to {SYSTEM.escalationContacts[0].split(" ")[0]} &amp; Halt Auto-Pay
            </>
          )}
        </button>
        <p className="mt-2 text-center font-mono text-[10px] text-slate-500">
          Freezes the payment, resolves the finance ticket, and clears the
          Pending Invoices KPI.
        </p>
      </section>
    </div>
  );
}
