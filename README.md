# BlueDot OpsPulse — Portal & Control Room

An internal operational control room for **BlueDot Impact** course operations. It turns the Monday-morning pile — facilitator emergencies, at-risk cohorts, escalations, and financial anomalies — into a single triaged surface where the Course Operations Lead can *see* the state of the round and *act* on it, with every action recalculating the live metrics.

Built for the **Technical AI Safety** course (Round 4, Week 4 of 5, 60 participants, 6 cohorts), but the model generalises to any course.

---

## Executive Summary — for Dewi & Li-Lian

> **The problem.** When the course lead is unreachable, operational signal is scattered across email, Slack, pulse surveys, an admissions queue, and billing. A silent automation failure or a single furious participant can sit unseen for 48 hours and become a public-reputation event. There is no single place that answers *"how healthy is the round right now, and what needs me first?"*

**OpsPulse answers that in one screen.** A weighted **System Health Index** (currently **68% — Action Required**) aggregates every open incident by severity, so leadership can read the state of the round at a glance. Four modules let the operator move from signal to resolution without leaving the tab:

| Module | What it does | This Monday |
| --- | --- | --- |
| **Control Room** | KPIs, quality-variance and onboarding charts, live P0/P1 feed | Surfaces the C11 reputation crisis and the C12 onboarding failure side by side |
| **Cohort Triage** | Risk-ranked grid + one-click action drawers | Suspend a facilitator & deploy cover; remedy a failed onboarding |
| **Backup Matcher** | Timezone/availability-aware facilitator scheduling | Fills the Thursday (C10) and Friday (C11) gaps at the £80 backup rate |
| **Financial Hygiene** | Anomaly audit + escalation templating | Halts the 10× Notion invoice before auto-pay and escalates with a recommendation |

**Why it matters at scale.** As BlueDot runs more courses with more cohorts, the failure mode is not any single incident — it is *silent* incidents and *uncalibrated* first responses under time pressure. OpsPulse makes the invisible visible (a 0%-delivery bar next to 5 transfer requests) and pre-loads the calibrated response (drafted comms, halt-and-escalate flows), so a teammate covering on a Monday can act in minutes, not hours.

**The headline number:** when every queued action in this demo is taken, System Health climbs **68% → 100%** in four clicks — a visual proof that the pile is fully tractable.

---

## What is modelled (this round)

- **Cohort 10 / Tom Reeves** — facilitator down with flu Monday AM; Thursday 6-8pm needs cover.
- **Cohort 11 / Jamie Whitford** — pulse collapse (4.5 → 2.1), a public-exposure threat from a senior ML engineer due Tuesday EOD, an anonymous culture complaint, and an MIT Tech Review press inquiry on the same clock.
- **Cohort 12 / Ben Carter** — welcome-email automation failed silently (0/12 sent), driving "flat energy" feedback and 5 transfer requests.
- **Finance** — Notion Enterprise renewal billed at $48,000 vs $4,800 last year (root cause: domain-capture auto-provisioned 215 phantom seats).
- **Backup pool** — 4 trained backups (2 UK-timezone) at £80/session + 2 Teaching Fellows (£120) held in reserve.

> **Note on data.** This is a self-contained demo. All names and figures are seeded mock data dramatised from the work-test brief; no live systems are connected. The interactions are real (state mutates, charts and KPIs recompute) — the integrations are simulated.

---

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript** (strict)
- **Tailwind CSS** for styling (custom dark "mission-control" theme)
- **Recharts** for the quality-variance and onboarding visualisations
- **Lucide React** for iconography
- Fonts: **Sora** (display) + **IBM Plex Mono** (metrics) via `next/font`

State is centralised in `src/app/page.tsx` and flows down as props; action handlers mutate the single source of truth so every KPI, badge, and chart stays in sync.

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
# → http://localhost:3000

# 3. Production build (also the Vercel build command)
npm run build
npm start
```

**Deploy to Vercel:** push this repo to GitHub and import it in Vercel — no environment variables required. The build is configured to compile cleanly (`next build`) with no external services.

---

## Project structure

```
src/app/
├── data/
│   └── mockData.ts        # Types + seed state (cohorts, incidents, backups, finance)
├── components/
│   ├── Sidebar.tsx        # Nav + live System Health badge
│   ├── ControlRoom.tsx    # KPIs + Recharts + priority incident feed
│   ├── CohortTriage.tsx   # Risk grid + action drawer
│   ├── BackupMatcher.tsx  # Shift-aware facilitator scheduling
│   └── FinanceAuditor.tsx # Invoice audit + escalation template
├── layout.tsx             # Fonts + dark shell
├── globals.css            # Theme, blueprint grid, animations
└── page.tsx               # State orchestrator (the spine)
```

---

## Try it (60-second tour)

1. **Control Room** — read the 68% health index and the C11 pulse line plummeting to 2.1.
2. **Cohort Triage → Cohort 11** — open the drawer, hit **Suspend Jamie & Deploy Backup**. Watch the P0 clear and health jump.
3. **Cohort Triage → Cohort 12** — **Trigger Manual Backup Blast** to remedy the onboarding failure.
4. **Backup Matcher** — pick *Thursday 6-8pm UK*; only UK/available backups light up. **Assign** one.
5. **Financial Hygiene** — **Escalate & Halt Auto-Pay**; the Pending Invoices KPI clears and the message copies to your clipboard.

---

## Operational Roadmap

OpsPulse is deliberately a thin, fast control surface. The strategic value compounds as the simulated flows become live integrations:

### Phase 1 — Connect the signal (next quarter)
- **Customer.io webhooks** → ingest welcome-email delivery events in real time. The C12 failure mode (silent 0/12) becomes an automatic P1 the moment the automation misfires, with a one-click manual-send remedy. *No more silent failures.*
- **Pulse-survey API** → stream weekly scores directly into the quality-variance chart; auto-flag any cohort dropping >1.0 week-on-week (C11 would have alerted in Week 2, not Week 4).
- **Slack API** → the "Assign & Send Slack Alert" button posts a real message to `#ops-facilitators` with the handover checklist, and incident threads sync two-way.

### Phase 2 — Close the loop (H2)
- **Admissions queue integration** → the Tuesday-deadline candidate surfaces as a time-boxed task with an SLA timer, so deadline-sensitive yeses never expire in a queue.
- **Finance guardrails** → auto-hold any vendor invoice that deviates >2× from its trailing baseline; route to the escalation template pre-filled.
- **Comms library** → calibrated, versioned response templates (reputation threat, press inquiry, deferral, transfer) attached to each incident type.

### Phase 3 — AI-driven triage (next year)
- **AI ticket triage** → an LLM classifier reads the inbound pile (email, Slack, forwarded escalations), assigns priority and cohort, drafts the calibrated first response, and pre-stages the recommended action — the operator reviews and ships rather than starts from a blank page.
- **Predictive risk scoring** → blend pulse trajectory, attendance, facilitator history, and onboarding health into a forward-looking cohort risk score, so intervention happens before the pulse collapses.
- **Weekend digest** → a Monday-09:00 auto-generated brief: "here is your pile, here is what I'd do, here is what needs your call."

---

*Built as a portfolio artifact for the BlueDot Impact Course Operations Lead work test. Interactions are functional; integrations are simulated.*
