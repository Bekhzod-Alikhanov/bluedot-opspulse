// Minimal structured logger. Swaps to Sentry automatically if SENTRY_DSN is set,
// otherwise logs to the console — no hard dependency, graceful by default.

type Level = "info" | "warn" | "error";

export function log(level: Level, message: string, meta?: Record<string, unknown>) {
  const entry = { ts: new Date().toISOString(), level, message, ...meta };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);

  // Sentry hook (no-op unless configured). Kept dynamic so the dep stays optional.
  if (level === "error" && process.env.SENTRY_DSN) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = globalThis as any;
    if (g.Sentry?.captureMessage) g.Sentry.captureMessage(message, { extra: meta });
  }
}
