# BlueDot OpsPulse

OpsPulse is a full-stack course-operations control room built for a timed operations work-test scenario. It turns a Monday-morning pile of course issues into a triaged surface where an operations lead can see priority, ship calibrated communications, and choose one systemic fix before the same issues recur.

Live demo: [bluedot-opspulse.vercel.app](https://bluedot-opspulse.vercel.app)

Use the one-click demo login as **Ops Lead** or **Management**. No signup is required.

> This dashboard is a supplementary artifact. The written work-test submission remains the source of truth; the dashboard shows how the Monday sweep and triage decisions could be operationalised in software.

## What It Shows

| Area | Purpose |
| --- | --- |
| **Control Room** | A first-screen Monday Decision Brief with priority, owner, deadline, rationale, and next action. |
| **Triage Queue** | One ranked inbox with priority, SLA timers, notes, snooze, manual creation, and audit history. |
| **Drafts Shipped** | Actual calibrated comms drafts grouped by recipient, channel, deadline, and readiness. |
| **Systemic Fix** | A Monday Course Health Sweep checklist, RAG rules, and automation-failure runbook. |
| **Backup Matcher** | Timezone and availability-aware facilitator cover, with reserve capacity clearly marked. |
| **Financial Hygiene** | Invoice anomaly handling that starts with payment hold and vendor verification before conclusions. |
| **Monitors & Alerts** | Prevention checks that surface silent failures before they become Monday-morning surprises. |
| **Leadership Cockpit** | Trends, risk register, predictive risk, cost signals, and a digest for senior stakeholders. |

## Why This Exists

The work-test scenario rewards three things:

- **Prioritisation:** separate urgent participant, press, delivery, admissions, cover, and finance issues without treating every item as equally critical.
- **Calibrated communication:** draft messages that are fast, human, and appropriately cautious where facts still need checking.
- **Systemic thinking:** ship a repeatable Monday health sweep instead of only firefighting the current pile.

OpsPulse keeps those three criteria visible. The first screen answers: what matters, why it matters, who owns it, and what happens next.

## Tech Stack

| Layer | Choice |
| --- | --- |
| **Framework** | Next.js 16 App Router, Server Components, Server Actions |
| **Language** | TypeScript, React 19 |
| **Database/Auth/Realtime** | Supabase Postgres, RLS, Realtime |
| **Styling** | Tailwind CSS with a custom operations-dashboard theme |
| **Charts/Icons** | Recharts, Lucide React |
| **Integrations** | Resend, Slack webhook, calendar invite generation, all with demo-mode fallbacks |
| **Quality** | ESLint, TypeScript, Vitest, Playwright, production build checks |
| **Hosting** | Vercel |

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Quality gates:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Optional environment variables:

- `RESEND_API_KEY` and `DIGEST_TO` for real email delivery.
- `SLACK_WEBHOOK_URL` for real Slack alerts.
- Without these keys, outbound actions simulate cleanly for the public demo.

## Architecture Notes

- Server Components read data through Supabase with row-level security.
- Mutations run as Server Actions using a service-role client, append an audit event, trigger integrations, then revalidate affected routes.
- Realtime subscriptions keep queue and alert state fresh across open sessions.
- The System Health Index is computed from open incident impact, so operational actions visibly improve the dashboard.
- The demo reset flow restores a pristine seeded state for reviewers.

## Data And Privacy

This is a self-contained demo with fictionalized operational data. Public project materials intentionally avoid naming actual people from the organization behind the work-test scenario. Any names visible inside the live demo are scenario data used to demonstrate triage and communication workflows, not a claim about real events.

## Status

- Deployed production demo: [bluedot-opspulse.vercel.app](https://bluedot-opspulse.vercel.app)
- Latest verification: lint, typecheck, 24 unit tests, production build, and live Playwright smoke pass.
