"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[opspulse] route error", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="panel max-w-md rounded-2xl p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 ring-1 ring-rose-500/30">
          <AlertTriangle className="h-6 w-6 text-rose-300" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-100">Something went sideways</h2>
        <p className="mt-1.5 text-sm text-slate-400">
          This view hit an error loading its data. The rest of the control room is fine.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[10px] text-slate-600">ref: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-signal-soft"
        >
          <RotateCw className="h-4 w-4" /> Try again
        </button>
      </div>
    </div>
  );
}
