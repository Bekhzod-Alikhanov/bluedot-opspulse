"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Loader2, Check } from "lucide-react";
import { resetDemoData } from "@/lib/actions";

export default function ResetDemoButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const reset = () =>
    startTransition(async () => {
      await resetDemoData();
      router.refresh();
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    });

  return (
    <button
      onClick={reset}
      disabled={pending}
      title="Restore the demo to its pristine Monday-morning state"
      className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 font-mono text-[11px] text-slate-300 transition hover:border-slate-600 hover:text-slate-100 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : done ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <RotateCcw className="h-3.5 w-3.5" />
      )}
      {done ? "Demo reset" : "Reset demo data"}
    </button>
  );
}
