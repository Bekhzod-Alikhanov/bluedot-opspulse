import "server-only";
import { Resend } from "resend";
import type { IntegrationResult } from "./slack";

// Send an email via Resend. Simulates cleanly when RESEND_API_KEY is unset.
export async function sendEmail(opts: {
  to?: string;
  subject: string;
  text: string;
}): Promise<IntegrationResult> {
  const key = process.env.RESEND_API_KEY;
  const to = opts.to || process.env.DIGEST_TO;
  const from = process.env.DIGEST_FROM || "OpsPulse <onboarding@resend.dev>";

  if (!key || !to) {
    return {
      ok: true,
      demoMode: true,
      detail: "Simulated email (set RESEND_API_KEY + a recipient to send for real).",
    };
  }
  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from,
      to,
      subject: opts.subject,
      text: opts.text,
    });
    return error
      ? { ok: false, demoMode: false, detail: `Resend error: ${error.message}` }
      : { ok: true, demoMode: false, detail: `Email sent to ${to}.` };
  } catch (e) {
    return { ok: false, demoMode: false, detail: `Email failed: ${String(e)}` };
  }
}
