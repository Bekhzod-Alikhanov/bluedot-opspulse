"use client";

import { useState, useTransition } from "react";
import { FileText, Copy, Check, Send, Loader2 } from "lucide-react";
import type { CommsTemplate } from "@/lib/types";
import { sendTemplate } from "@/lib/actions";

export default function TemplatesView({ templates }: { templates: CommsTemplate[] }) {
  const [openId, setOpenId] = useState<string | null>(templates[0]?.id ?? null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);
  const [to, setTo] = useState("");
  const [pending, startTransition] = useTransition();

  const copy = async (t: CommsTemplate) => {
    try { await navigator.clipboard.writeText(`${t.subject}\n\n${t.body}`); setCopiedId(t.id); setTimeout(() => setCopiedId(null), 1800); } catch {}
  };
  const send = (t: CommsTemplate) => startTransition(async () => {
    const res = await sendTemplate(t.id, to || undefined);
    setSentId(t.id);
    setTimeout(() => setSentId(null), 3500);
    void res;
  });

  return (
    <div className="space-y-6">
      <header className="animate-fade-up">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-50"><FileText className="h-6 w-6 text-signal" /> Comms Library</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">Calibrated, versioned responses per incident type — so anyone covering a Monday acts fast and consistently, without reinventing the wording under pressure.</p>
      </header>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {templates.map((t, i) => {
          const open = openId === t.id;
          return (
            <div key={t.id} style={{ animationDelay: `${i * 40}ms` }} className="panel animate-fade-up rounded-xl p-4">
              <button onClick={() => setOpenId(open ? null : t.id)} className="flex w-full items-start justify-between gap-3 text-left">
                <div>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-400">{t.category}</span>
                  <p className="mt-1.5 text-sm font-semibold text-slate-100">{t.name}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-500">{t.subject}</p>
                </div>
              </button>
              {open && (
                <div className="mt-3">
                  <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950/60 p-3 font-mono text-[11.5px] leading-relaxed text-slate-300">{t.body}</pre>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button onClick={() => copy(t)} className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 font-mono text-[11px] text-slate-300 transition hover:text-slate-100">
                      {copiedId === t.id ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                    </button>
                    <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="recipient@email (optional)" className="flex-1 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 font-mono text-[11px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-signal/40" />
                    <button onClick={() => send(t)} disabled={pending} className="flex items-center gap-1.5 rounded-lg bg-signal px-3 py-1.5 text-[12px] font-semibold text-slate-950 transition hover:bg-signal-soft disabled:opacity-60">
                      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : sentId === t.id ? <Check className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                      {sentId === t.id ? "Sent" : "Send"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
