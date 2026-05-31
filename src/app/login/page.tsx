import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in — BlueDot OpsPulse" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-signal/15 ring-1 ring-signal/40">
            <span className="absolute h-2.5 w-2.5 rounded-full bg-signal" />
            <span className="absolute h-2.5 w-2.5 animate-pulse-ring rounded-full bg-signal" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-50">OpsPulse</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              BlueDot · Control Room
            </p>
          </div>
        </div>

        <div className="panel rounded-2xl p-6">
          <h1 className="text-center text-lg font-semibold text-slate-100">
            Sign in to the control room
          </h1>
          <p className="mt-1 text-center text-sm text-slate-400">
            Operations triage &amp; leadership cockpit for the Technical AI Safety course.
          </p>

          <LoginForm />
        </div>

        <p className="mt-6 text-center font-mono text-[11px] text-slate-600">
          Reviewer? Use a one-click demo role above &mdash; no signup needed.
        </p>
      </div>
    </main>
  );
}
