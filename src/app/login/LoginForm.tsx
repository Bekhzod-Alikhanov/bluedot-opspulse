"use client";

import { useState, useTransition, useActionState } from "react";
import { Shield, Crown, LogIn, Loader2 } from "lucide-react";
import { signInWithPassword, signInDemo } from "./actions";

export default function LoginForm() {
  const [state, formAction] = useActionState(signInWithPassword, null);
  const [pending, startTransition] = useTransition();
  const [demoRole, setDemoRole] = useState<"ops" | "management" | null>(null);

  const enterDemo = (role: "ops" | "management") => {
    setDemoRole(role);
    startTransition(() => {
      signInDemo(role);
    });
  };

  return (
    <div className="mt-6">
      {/* One-click demo roles */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => enterDemo("ops")}
          disabled={pending}
          className="group flex flex-col items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-left transition hover:border-signal/50 hover:bg-signal/5 disabled:opacity-60"
        >
          <Shield className="h-5 w-5 text-signal" />
          <span className="text-sm font-semibold text-slate-100">
            Enter as Ops Lead
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            {pending && demoRole === "ops" ? "Signing in…" : "Daily triage"}
          </span>
        </button>
        <button
          onClick={() => enterDemo("management")}
          disabled={pending}
          className="group flex flex-col items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-left transition hover:border-violet-500/50 hover:bg-violet-500/5 disabled:opacity-60"
        >
          <Crown className="h-5 w-5 text-violet-300" />
          <span className="text-sm font-semibold text-slate-100">
            Enter as Management
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            {pending && demoRole === "management" ? "Signing in…" : "Leadership cockpit"}
          </span>
        </button>
      </div>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-800" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
          or sign in
        </span>
        <span className="h-px flex-1 bg-slate-800" />
      </div>

      {/* Email / password */}
      <form action={formAction} className="space-y-3">
        <input
          name="email"
          type="email"
          required
          placeholder="you@bluedot.org"
          className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-signal/50"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-signal/50"
        />
        {state?.error && (
          <p className="text-xs text-rose-400">{state.error}</p>
        )}
        <SubmitButton />
      </form>
    </div>
  );
}

function SubmitButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="submit"
      onClick={() => startTransition(() => {})}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogIn className="h-4 w-4" />
      )}
      Sign in
    </button>
  );
}
