import "server-only";

export interface IntegrationResult {
  ok: boolean;
  demoMode: boolean;
  detail: string;
}

// Post a message to Slack via an incoming webhook.
// Falls back to a simulated success when SLACK_WEBHOOK_URL is unset.
export async function sendSlack(
  text: string,
  context?: string
): Promise<IntegrationResult> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) {
    return {
      ok: true,
      demoMode: true,
      detail: "Simulated Slack post (set SLACK_WEBHOOK_URL to send for real).",
    };
  }
  try {
    const blocks = [
      { type: "section", text: { type: "mrkdwn", text } },
    ];
    if (context) {
      blocks.push({
        type: "context",
        // @ts-expect-error Slack context element shape
        elements: [{ type: "mrkdwn", text: context }],
      });
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, blocks }),
    });
    return res.ok
      ? { ok: true, demoMode: false, detail: "Slack alert delivered." }
      : { ok: false, demoMode: false, detail: `Slack error ${res.status}.` };
  } catch (e) {
    return { ok: false, demoMode: false, detail: `Slack failed: ${String(e)}` };
  }
}
