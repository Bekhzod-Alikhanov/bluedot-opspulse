export type BriefPriority = "P0" | "P1" | "P2";
export type DraftReadiness = "Ready to send" | "Needs fact check" | "Needs leadership input";

export interface DecisionBriefItem {
  id: string;
  item: string;
  priority: BriefPriority;
  title: string;
  why: string;
  action: string;
  owner: string;
  deadline: string;
  status: string;
}

export interface ShippedDraft {
  id: string;
  category: string;
  recipient: string;
  channel: string;
  deadline: string;
  readiness: DraftReadiness;
  subject: string;
  body: string;
}

export interface SweepCheck {
  id: string;
  check: string;
  redFlag: string;
  action: string;
  example: string;
}

export interface MonitorPreviewFinding {
  id: string;
  severity: BriefPriority;
  monitor: string;
  title: string;
  detail: string;
  cohortCode: string | null;
}

export const decisionBrief: DecisionBriefItem[] = [
  {
    id: "item-1",
    item: "Item 1",
    priority: "P0",
    title: "Sarah Chen public-post threat",
    why: "Participant trust, public reputation, and a Tuesday deadline. Needs acknowledgement before facts are fully settled.",
    action: "Acknowledge today, open facilitator review, pause Jamie pending review, commit to a written plan by Tuesday 6pm.",
    owner: "Course Ops Lead",
    deadline: "Today 10:00; full plan Tue 18:00",
    status: "Draft ready",
  },
  {
    id: "item-3",
    item: "Item 3",
    priority: "P0",
    title: "Anonymous C11 culture concern",
    why: "Same facilitator cluster as Sarah, with inclusion/safety sensitivity and identifying details to protect.",
    action: "Offer a private call, keep identity confidential unless safety requires action, feed facts into the Jamie review.",
    owner: "Course Ops Lead",
    deadline: "Within 24h",
    status: "Draft ready",
  },
  {
    id: "item-8",
    item: "Item 8",
    priority: "P1",
    title: "MIT Technology Review inquiry",
    why: "Press question is on the same Tuesday clock as C11 and asks directly about quality at scale.",
    action: "Send holding reply, ask for specific claims, coordinate a calibrated line with Dewi/comms before quoting.",
    owner: "Course Ops Lead + Dewi/comms",
    deadline: "Holding reply today; statement Tue noon",
    status: "Needs leadership input",
  },
  {
    id: "item-9",
    item: "Item 9",
    priority: "P1",
    title: "C12 welcome email failed silently",
    why: "The cohort meets tonight and 12 participants were underprepared because a core automation failed.",
    action: "Send the welcome pack manually to the whole cohort, not only the five who chased, and log a fail-loud fix.",
    owner: "Course Ops Lead",
    deadline: "Today before C12 session",
    status: "Draft ready",
  },
  {
    id: "item-5",
    item: "Item 5",
    priority: "P1",
    title: "Five C12 transfer requests",
    why: "Clustered requests are a cohort-health signal, not just admin. Some are schedule, some are quality concerns.",
    action: "Handle genuine schedule clashes 1:1; ask learning-experience requests to attend the reset session first.",
    owner: "Course Ops Lead + Ben",
    deadline: "Today",
    status: "Plan ready",
  },
  {
    id: "item-4",
    item: "Item 4",
    priority: "P1",
    title: "Admissions candidate deadline",
    why: "A clear yes could be lost to a competing programme because Sam is unavailable.",
    action: "Approve both rubric-clear candidates under ops authority; send the competing-offer acceptance today and note the override.",
    owner: "Course Ops Lead",
    deadline: "Today EOD",
    status: "Clear call",
  },
  {
    id: "item-2",
    item: "Item 2",
    priority: "P1",
    title: "C10 facilitator cover gap",
    why: "Tom gave early notice and Thursday can still be covered without escalating to Sam.",
    action: "Book a UK-timezone GBP80 backup facilitator and ask Tom for short handover notes.",
    owner: "Course Ops Lead",
    deadline: "Confirm by today 14:00",
    status: "Operational clear",
  },
  {
    id: "item-6",
    item: "Item 6",
    priority: "P2",
    title: "Marcus health deferral",
    why: "Straightforward participant-support request with a standard path.",
    action: "Approve deferral to next round, hold his place, and send a warm confirmation.",
    owner: "Course Ops Lead",
    deadline: "Within 48h",
    status: "Draft ready",
  },
  {
    id: "item-7",
    item: "Item 7",
    priority: "P2",
    title: "NotionTools invoice anomaly",
    why: "Large financial variance, but less immediate than participant/press risk if auto-pay is halted.",
    action: "Pause auto-pay, verify vendor/domain through known channels, then escalate the working hypothesis and recommendation.",
    owner: "Course Ops Lead + finance owner",
    deadline: "Before payment window closes",
    status: "Needs verification",
  },
];

export const shippedDrafts: ShippedDraft[] = [
  {
    id: "leadership-fyi",
    category: "Internal",
    recipient: "Dewi + Li-Lian",
    channel: "Slack",
    deadline: "Today 09:45",
    readiness: "Ready to send",
    subject: "Course-quality risk: C11 + C12",
    body: `Hi Dewi and Li-Lian,

I am treating this morning as a course-quality issue with two live risks: Cohort 11/Jamie and Cohort 12. I am not asking for permission, just keeping you close because this may affect participant trust and press response.

Cohort 11: Sarah Chen has complained about Jamie being late, camera off, and giving very limited feedback. She also challenged the "world-class facilitators" wording and may post publicly if she does not get a written reply by EOD Tuesday. Separately, another participant wants to talk about a dismissive comment Jamie made. Hannah Liu from MIT Technology Review is also asking about Cohort 11 by Tuesday.

My plan today: reply to Sarah before 10am, offer the second participant a private call, ask Jamie for factual context, review session/pulse/feedback records, and decide by Tuesday lunch whether C11 needs replacement cover or TF support. I will send Hannah a holding reply and ask for the specific points she plans to put to us.

Cohort 12: the welcome email failed and five participants asked to switch. I am sending the prep pack to the whole cohort now, asking Ben to reset tonight's session, and trying to get a strong backup/TF to support.

Other items: I will approve the two admissions yeses, find Thursday cover for Tom, approve Marcus's deferral, and hold the $48k NotionTools invoice until the increase is verified.`,
  },
  {
    id: "sarah-chen",
    category: "Escalation",
    recipient: "Sarah Chen",
    channel: "Email",
    deadline: "Today 10:00",
    readiness: "Ready to send",
    subject: "Re: Cohort 11 facilitator and what BlueDot is misrepresenting publicly",
    body: `Hi Sarah,

Thank you for reaching out, and for giving us the chance to respond before you post publicly. I am sorry this has been your experience.

The pattern you describe - repeated lateness, camera off without clear reason, and one-line feedback on a reflection you spent real time on - is not acceptable. Sam is away this week, so I am taking this forward.

Today and tomorrow I will review the Cohort 11 record, speak with Jamie, and speak with participants who want to share details privately. I am also pausing any new Jamie assignments while I review this.

I will send you a written update by Tuesday 6pm covering what we found, the plan for the rest of Cohort 11, and how we will handle the question you raised about the facilitator claim on the course page. I do not want to give you a defensive answer before checking the facts.

If you are willing, I would value 15 minutes to hear from you today or tomorrow. Written context is also fine. I hope we can still repair the experience while the course is running.

Best,
Course Operations`,
  },
  {
    id: "anonymous-c11",
    category: "Participant care",
    recipient: "Anonymous C11 participant",
    channel: "Email",
    deadline: "Within 24h",
    readiness: "Ready to send",
    subject: "Thank you for raising this",
    body: `Hi,

Thank you for telling us. I am sorry you have had to sit with this without a clear place to raise it. You do not need to make a formal complaint for us to take it seriously.

We can start with a private conversation and agree what, if anything, should happen next. I can speak today between 5-8pm UK. If you prefer not to put details in writing, that is completely fine.

I will not share your name or identifying details with Jamie without checking with you first, unless there is a safety reason that means I have to act.

What I want to understand is what happened, how it affected you, and what would make it reasonable for you to return to the next session.

Best,
Course Operations`,
  },
  {
    id: "jamie-dm",
    category: "Facilitator review",
    recipient: "Jamie Whitford",
    channel: "Slack DM",
    deadline: "Today 13:00",
    readiness: "Needs fact check",
    subject: "Cohort 11 concerns - context needed today",
    body: `Hi Jamie,

I would like to speak with you today about Cohort 11. We have received several concerns about the cohort experience, and I want to handle it fairly.

The concerns include lateness to two sessions, camera off, and very brief feedback on a reflection. Please do not message the cohort about this or try to work out who raised it before we speak. I am limiting identifying details while I understand what happened.

Could you send me by 1pm your view of the last three sessions, any reason for the issues above, and how you have been handling written feedback?

The feedback I received may not be fully accurate, but the pattern is serious and we need to decide how the remaining Cohort 11 sessions should run. I am pausing new assignments for you until this review is complete.`,
  },
  {
    id: "hannah-press",
    category: "Press",
    recipient: "Hannah Liu, MIT Technology Review",
    channel: "Email",
    deadline: "Today",
    readiness: "Needs leadership input",
    subject: "Re: AI safety education at scale",
    body: `Hi Hannah,

Thank you for reaching out, and for giving BlueDot the chance to respond before publication.

I am covering Course Operations for Technical AI Safety this week and we are reviewing the Cohort 11 feedback today. I do not want to give you a detailed quote before we have checked the delivery record and spoken with the people involved.

I can send a short attributable statement by Tuesday midday. We will not discuss identifiable participant details, but we can speak to how we monitor course quality and what we do when several signals point to a cohort or facilitator issue.

Could you please send the points you plan to put to BlueDot about Cohort 11? That will help us respond accurately.

Best,
Course Operations`,
  },
  {
    id: "cohort-12",
    category: "Onboarding",
    recipient: "Cohort 12 participants",
    channel: "Email",
    deadline: "Before 18:00 session",
    readiness: "Ready to send",
    subject: "Your BlueDot cohort starts tonight - welcome pack inside",
    body: `Hi everyone,

I want to apologise for an operational miss. The welcome email that should have gone out before your first session did not send, and we did not catch it. That is on us.

Here is what you need for tonight:
- Session: Monday 6-8pm UK
- Zoom link
- Course page/LMS link
- Prep materials link
- Slack link

Please bring one question from the prep and one example you want to discuss.

Ben will spend the first few minutes resetting context and making sure everyone knows what matters most for the session. We will also tighten the discussion format so the time is more useful.

I have seen several cohort-switch requests and will reply individually today. For genuine schedule clashes, I will check capacity. For concerns about the learning experience, I ask you to attend tonight if you can, because we are making changes now and I want to see if we can recover the group.

Best,
Course Operations`,
  },
  {
    id: "ben-dm",
    category: "Facilitator support",
    recipient: "Ben Carter",
    channel: "Slack DM",
    deadline: "Before C12 session",
    readiness: "Ready to send",
    subject: "Cohort 12 reset tonight",
    body: `Hi Ben,

Cohort 12 is now a cohort-health flag, not just admin. The welcome emails failed and five participants asked to switch, with reasons including schedule, flat energy, and wanting a more experienced facilitator.

Tonight needs to feel better. Please open by briefly acknowledging the onboarding miss, then run a more structured discussion: quick round, smaller-group or paired discussion if possible, then full-group synthesis. Use specific prompts rather than broad "any thoughts?" questions.

I am trying to get a TF or strong backup to support and observe. That is to help us recover the cohort, not to undermine you.

After the session, please send me notes on attendance, energy, what worked, what did not, and any follow-up needed.`,
  },
  {
    id: "tom-cover",
    category: "Cover",
    recipient: "Tom + backup facilitator",
    channel: "Slack DMs",
    deadline: "Today 14:00",
    readiness: "Ready to send",
    subject: "C10 Thursday cover",
    body: `To backup facilitator:

Hi, are you available to cover Technical AI Safety Cohort 10 this Thursday, 6-8pm UK time? Tom has flu and will not be able to run it. Rate is the usual backup rate of GBP80. Tom can send handover notes and I can send the materials. Could you confirm by 2pm today?

To Tom:

Hi Tom, thanks for flagging early, and sorry you are so unwell. Please do not try to push through. I am finding cover now. If you are well enough later today or tomorrow, a short handover note would help: cohort dynamics, any risks, and what you planned to emphasise. Bullets are fine.`,
  },
  {
    id: "short-clears",
    category: "Operational clears",
    recipient: "Admissions, Marcus, finance owner",
    channel: "Email/internal notes",
    deadline: "Today",
    readiness: "Needs fact check",
    subject: "Admissions, deferral, invoice",
    body: `Admissions note:
Approved by Course Ops Lead because Sam is unavailable and both applications are clearly suitable on the rubric. Career-switcher flag noted, but not a blocker given the scores. Sam to be informed later.

Candidate email:
Good news - we would like to offer you a place on Technical AI Safety. To confirm, please complete the acceptance form by Friday. If one specific question would help you decide between programmes, reply here and I will answer today.

Marcus:
I am sorry to hear about the diagnosis. Yes, we can defer your place to the next round. I will mark this as a health deferral and we will contact you before the next round with rejoining details. Please focus on recovering.

Invoice note:
Please do not pay NotionTools invoice #20451 yet. It is $48k vs $4.8k last year with no explanation. I am pausing auto-pay and verifying the sender/domain through our actual Notion account and known vendor contact before replying to the sender.`,
  },
];

export const sweepDefinitionOfDone = [
  "Every active cohort is green, amber, or red by 09:45.",
  "Every red item has an owner, next action, and deadline.",
  "Participant-facing recovery messages are sent or drafted.",
  "Press, safety, inclusion, or leadership-sensitive issues are surfaced to the right person.",
];

export const sweepChecks: SweepCheck[] = [
  {
    id: "support-inbox",
    check: "Support inbox, last 3 days",
    redFlag: "3+ similar emails, complaint, journalist query, or public-post threat",
    action: "Group related signals into one incident owner and one response plan.",
    example: "C11 Sarah + anonymous concern + press; C12 welcome misses",
  },
  {
    id: "facilitator-messages",
    check: "Slack and facilitator messages",
    redFlag: "Sickness, no-show risk, or repeated delivery concern",
    action: "Find cover or start a fair facilitator review before the next session.",
    example: "Tom flu; Jamie concerns",
  },
  {
    id: "automation-sends",
    check: "Automation sends",
    redFlag: "Expected participant email did not send",
    action: "Manually resend to the whole affected cohort and log a fail-loud fix.",
    example: "C12 welcome email",
  },
  {
    id: "pulse-switches",
    check: "Pulse and switch requests",
    redFlag: "Low feedback or 3+ switch requests from one cohort",
    action: "Treat as cohort health, not queue admin.",
    example: "C12 switch cluster",
  },
  {
    id: "admissions",
    check: "Admissions deadlines",
    redFlag: "Candidate decision due in 3 days and owner unavailable",
    action: "Ops can decide clear rubric cases and leave a note for Sam.",
    example: "Two clear yeses, one competing deadline",
  },
  {
    id: "billing",
    check: "Vendor and billing",
    redFlag: "Unexpected large increase or suspicious sender",
    action: "Hold payment, verify vendor through known channels, then ask for breakdown.",
    example: "NotionTools invoice",
  },
];

export const ragRules = [
  { label: "Green", text: "No clustered issues; next session can run as planned." },
  { label: "Amber", text: "One warning sign; owner checks before the next session." },
  { label: "Red", text: "Participant trust, safety/inclusion, press, failed participant automation, facilitator reliability, or 3+ similar requests." },
];

export const automationFailureRunbook = [
  "Confirm affected cohort and recipient count.",
  "Send the missing email manually to the whole affected cohort, not only people who complained.",
  "Own the miss in plain words.",
  "Include practical info in the email itself, not only links.",
  "Log the incident and ask Product/Engineering for an alert when a scheduled send fails.",
];

export const monitorPreviewFindings: MonitorPreviewFinding[] = [
  {
    id: "preview-pulse",
    severity: "P0",
    monitor: "Pulse collapse",
    title: "C11 pulse dropped 4.5 -> 2.1",
    detail: "Would have grouped Sarah's complaint, the culture concern, and the press inquiry before Monday triage.",
    cohortCode: "C11",
  },
  {
    id: "preview-email",
    severity: "P1",
    monitor: "Welcome-email delivery",
    title: "C12 welcome delivery 0/12",
    detail: "Would have alerted when the scheduled send failed, before five participants chased support.",
    cohortCode: "C12",
  },
  {
    id: "preview-cover",
    severity: "P1",
    monitor: "Facilitator cover gap",
    title: "C10 Thursday cover needed",
    detail: "Flags the open session gap and routes it to the GBP80 backup pool.",
    cohortCode: "C10",
  },
  {
    id: "preview-admissions",
    severity: "P1",
    monitor: "Admissions SLA",
    title: "Competing-offer candidate due today",
    detail: "Keeps clear yeses from stalling while the course lead is away.",
    cohortCode: null,
  },
  {
    id: "preview-invoice",
    severity: "P2",
    monitor: "Invoice variance",
    title: "10x vendor invoice variance",
    detail: "Auto-hold, verify sender/vendor, and escalate with a recommendation.",
    cohortCode: null,
  },
];
