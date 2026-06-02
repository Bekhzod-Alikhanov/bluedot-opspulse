-- =============================================================================
-- BlueDot OpsPulse v2 — schema + seed (run once in the Supabase SQL Editor)
-- Safe to re-run: drops and recreates app tables, leaves auth.* untouched.
-- =============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Drop (idempotent) in dependency order
-- ----------------------------------------------------------------------------
drop table if exists actions_log cascade;
drop table if exists assignments cascade;
drop table if exists alerts cascade;
drop table if exists incidents cascade;
drop table if exists risk_register cascade;
drop table if exists comms_templates cascade;
drop table if exists monitors cascade;
drop table if exists backups cascade;
drop table if exists round_metrics cascade;
drop table if exists cohorts cascade;
drop table if exists rounds cascade;
-- profiles is kept (linked to auth.users); created if missing below.

-- ----------------------------------------------------------------------------
-- profiles — one row per auth user, carries the role
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'ops' check (role in ('ops','management')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile when a new auth user is created.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'ops')
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- rounds — course rounds (history for management trends)
-- ----------------------------------------------------------------------------
create table rounds (
  id int primary key,
  name text not null,
  number int not null,
  status text not null check (status in ('completed','active','planned')),
  week int not null default 0,
  total_weeks int not null default 5,
  start_date date,
  end_date date
);

-- ----------------------------------------------------------------------------
-- round_metrics — one row per past round, feeds the cockpit trend charts
-- ----------------------------------------------------------------------------
create table round_metrics (
  round_id int references rounds(id) on delete cascade,
  avg_pulse numeric not null,
  completion_pct numeric not null,
  nps int not null,
  facilitator_cost int not null,
  vendor_cost int not null,
  transfers int not null,
  at_risk_cohorts int not null,
  primary key (round_id)
);

-- ----------------------------------------------------------------------------
-- cohorts — the active round's 6 cohorts
-- ----------------------------------------------------------------------------
create table cohorts (
  id int primary key,
  round_id int references rounds(id),
  code text not null,
  name text not null,
  facilitator text not null,
  schedule text not null,
  shift_key text not null,
  pulse jsonb not null,                 -- {"w1":4.5,"w2":3.2,"w3":2.1,"w4":2.3}
  onboarding_status text not null,
  email_delivery_pct int not null,
  transfer_requests int not null,
  participants int not null,
  risk text not null check (risk in ('Green','Amber','Red')),
  headline text not null,
  stabilized boolean not null default false
);

-- ----------------------------------------------------------------------------
-- incidents — the unified triage queue
-- ----------------------------------------------------------------------------
create table incidents (
  id text primary key,
  title text not null,
  priority text not null check (priority in ('P0','P1','P2')),
  status text not null default 'Open' check (status in ('Open','Resolved','Snoozed')),
  source text not null,
  description text not null,
  action text not null,
  health_impact int not null default 0,
  cohort_code text,
  round_id int references rounds(id),
  raised_at timestamptz not null default now(),
  sla_due timestamptz,
  assignee text,
  notes text,
  resolved_at timestamptz,
  resolved_by text,
  auto_created boolean not null default false
);

-- ----------------------------------------------------------------------------
-- backups — facilitator cover pool
-- ----------------------------------------------------------------------------
create table backups (
  id text primary key,
  name text not null,
  role text not null check (role in ('Backup Facilitator','Teaching Fellow')),
  location text not null,
  timezone text not null,
  is_uk boolean not null,
  status text not null check (status in ('Available','Busy')),
  cost_per_session int not null,
  rating numeric not null,
  specialties text not null
);

-- ----------------------------------------------------------------------------
-- assignments — bookings made through the Backup Matcher
-- ----------------------------------------------------------------------------
create table assignments (
  id serial primary key,
  backup_id text references backups(id),
  cohort_code text,
  shift_key text,
  shift_label text,
  rate int,
  created_by text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- monitors — prevention rules
-- ----------------------------------------------------------------------------
create table monitors (
  id text primary key,
  name text not null,
  description text not null,
  rule_key text not null,
  severity text not null check (severity in ('P0','P1','P2')),
  enabled boolean not null default true,
  last_run timestamptz,
  last_status text
);

-- ----------------------------------------------------------------------------
-- alerts — monitor firings
-- ----------------------------------------------------------------------------
create table alerts (
  id serial primary key,
  monitor_id text references monitors(id),
  severity text not null,
  title text not null,
  detail text not null,
  cohort_code text,
  incident_id text,
  acknowledged boolean not null default false,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- comms_templates — calibrated response library
-- ----------------------------------------------------------------------------
create table comms_templates (
  id text primary key,
  name text not null,
  category text not null,
  subject text not null,
  body text not null,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- risk_register — management-facing open risks
-- ----------------------------------------------------------------------------
create table risk_register (
  id serial primary key,
  title text not null,
  owner text not null,
  severity text not null check (severity in ('Low','Medium','High','Critical')),
  likelihood text not null,
  status text not null check (status in ('Open','Mitigating','Closed')),
  mitigation text not null,
  cohort_code text,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- actions_log — append-only audit trail
-- ----------------------------------------------------------------------------
create table actions_log (
  id serial primary key,
  actor text not null,
  actor_role text not null,
  action text not null,
  target_type text not null,
  target_id text,
  payload jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security: authenticated users may READ. Writes happen server-side
-- with the service-role key (which bypasses RLS), so no write policies needed.
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','rounds','round_metrics','cohorts','incidents','backups',
    'assignments','monitors','alerts','comms_templates','risk_register','actions_log'
  ] loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "auth read %1$s" on %1$I;', t);
    execute format('create policy "auth read %1$s" on %1$I for select to authenticated using (true);', t);
  end loop;
end $$;

-- Realtime: stream queue + alerts changes to clients.
alter publication supabase_realtime add table incidents;
alter publication supabase_realtime add table alerts;

-- ============================================================================
-- SEED DATA
-- ============================================================================

insert into rounds (id, name, number, status, week, total_weeks) values
  (1,'Round 1',1,'completed',5,5),
  (2,'Round 2',2,'completed',5,5),
  (3,'Round 3',3,'completed',5,5),
  (4,'Round 4',4,'active',4,5);

insert into round_metrics (round_id, avg_pulse, completion_pct, nps, facilitator_cost, vendor_cost, transfers, at_risk_cohorts) values
  (1, 4.2, 78, 41, 7200, 4800, 4, 1),
  (2, 4.3, 81, 46, 8400, 4800, 3, 0),
  (3, 4.4, 84, 52, 9600, 4800, 5, 1),
  (4, 3.9, 0,  0,  10800, 48000, 11, 3);  -- in-flight; completion/nps pending

insert into cohorts (id, round_id, code, name, facilitator, schedule, shift_key, pulse, onboarding_status, email_delivery_pct, transfer_requests, participants, risk, headline, stabilized) values
  (7, 4,'C7','Cohort 7','Aisha Rahman','Mondays 12-2pm UK','mon-12','{"w1":4.6,"w2":4.7,"w3":4.6,"w4":4.8}','Complete',100,0,10,'Green','Steady, high engagement. No action required.',false),
  (8, 4,'C8','Cohort 8','David Olusegun','Tuesdays 6-8pm UK','tue-18','{"w1":4.2,"w2":4.3,"w3":4.1,"w4":4.2}','Complete',100,1,10,'Green','Steady. One routine schedule-based transfer request.',false),
  (9, 4,'C9','Cohort 9','Priya Shankar','Wednesdays 7-9pm UK','wed-19','{"w1":4.7,"w2":4.8,"w3":4.9,"w4":4.8}','Complete',100,0,10,'Green','Popular, highly rated. One medical deferral pending (Marcus D.).',false),
  (10,4,'C10','Cohort 10','Tom Reeves','Thursdays 6-8pm UK','thu-18','{"w1":4.3,"w2":4.4,"w3":4.2,"w4":null}','Complete',100,0,10,'Amber','Facilitator down with flu as of Monday AM. Thursday 6-8pm session needs cover.',false),
  (11,4,'C11','Cohort 11','Jamie Whitford','Fridays 4-6pm UK','fri-16','{"w1":4.5,"w2":3.2,"w3":2.1,"w4":2.3}','Complete',100,0,10,'Red','SEVERE: pulse collapsed 4.5 to 2.1. Public-exposure threat (Tue), press inquiry, culture complaint.',false),
  (12,4,'C12','Cohort 12','Ben Carter','Mondays 6-8pm UK','mon-18','{"w1":3.0,"w2":2.8,"w3":3.1,"w4":2.9}','Failed (0/12 sent)',0,5,12,'Red','Onboarding automation failed silently (0/12 welcome emails). 5 active transfer requests.',false);

insert into backups (id, name, role, location, timezone, is_uk, status, cost_per_session, rating, specialties) values
  ('BF-01','Nadia Hassan','Backup Facilitator','London, UK','GMT (UK)',true,'Available',80,4.7,'RL safety, evals - trained R3.'),
  ('BF-02','Oliver Bennett','Backup Facilitator','Manchester, UK','GMT (UK)',true,'Available',80,4.5,'Interpretability - covered 6 sessions in R3.'),
  ('BF-03','Chen Wei','Backup Facilitator','Singapore','GMT+8 (SGT)',false,'Available',80,4.6,'Scalable oversight. Timezone-limited for UK evenings.'),
  ('BF-04','Sofia Marchetti','Backup Facilitator','Lisbon, Portugal','GMT+1 (WEST)',false,'Busy',80,4.4,'Policy crossover. Currently covering a maternity cohort.'),
  ('TF-01','Dr. Amara Okafor','Teaching Fellow','London, UK','GMT (UK)',true,'Available',120,4.9,'Senior. Reserve only - pulling her stalls cohort design work.'),
  ('TF-02','James Park','Teaching Fellow','Edinburgh, UK','GMT (UK)',true,'Busy',120,4.8,'Senior. Mid-curriculum redesign sprint this week.');

-- Incidents: the real 9-item pile. sla_due is set relative to now() at seed time.
insert into incidents (id, title, priority, status, source, description, action, health_impact, cohort_code, round_id, raised_at, sla_due, auto_created) values
  ('INC-2041','Public-exposure escalation - Cohort 11','P0','Open','Email · Sat 23:48 (cc Leadership, Sam)',
   'Sarah Chen (senior ML engineer) demands a written response by end of Tuesday or she goes public on EA Forum, LinkedIn and X. Cites lateness, camera off, one-line feedback, and a "world-class facilitators" claim she calls puffery. She has screenshots.',
   'Acknowledge in writing today, commit to a concrete plan for remaining C11 sessions, open a facilitator review, and align marketing copy.',
   12,'C11',4, now() - interval '34 hours', now() + interval '33 hours', false),
  ('INC-2038','Facilitator down - Thursday cover needed','P1','Open','Slack DM · Mon 06:14',
   'Tom Reeves (C10) has flu - high fever, can barely speak. Cannot run Thursday 6-8pm. Gave maximum notice and offered to brief whoever covers.',
   'Deploy a UK-timezone backup for Thursday 6-8pm at the GBP 80 rate; arrange a 15-min handover from Tom.',
   7,'C10',4, now() - interval '3 hours', now() + interval '80 hours', false),
  ('INC-2042','Onboarding automation failure - Cohort 12','P1','Open','Automation · detected Mon 09:00',
   'Welcome-email automation (T-48h before session 1) failed silently for all 12 C12 participants. Nobody caught it. Participants arrived unprepared - likely root cause of the "flat energy" feedback and 5 transfer requests.',
   'Manually send the welcome pack to all 12 today, then retro the automation so it fails loudly next time.',
   7,'C12',4, now() - interval '1 hour', now() + interval '7 hours', false),
  ('INC-2045','Press inquiry - MIT Technology Review','P1','Open','Email · Sat 09:23',
   'Hannah Liu (MIT Tech Review) is writing on AI-safety education quality at scale. Wants a quote with a number AND specifically asks about Cohort 11 feedback. Deadline end of Tuesday - same clock as the Sarah Chen threat.',
   'Loop in leadership/comms before responding. Do not free-style a quote; provide a calibrated holding line on the record.',
   3,'C11',4, now() - interval '46 hours', now() + interval '33 hours', false),
  ('INC-2039','Anonymous culture complaint - Cohort 11','P2','Open','Email · fwd by Sam, Sun 23:42',
   'Forwarded by Sam: a participant reports a dismissive comment by Jamie about a community they belong to. Not a formal complaint yet - wants someone at BlueDot to know before the next session.',
   'Acknowledge privately within 24h, offer a call, log confidentially. Feeds the facilitator review.',
   1,'C11',4, now() - interval '10 hours', now() + interval '14 hours', false),
  ('INC-2047','Notion Enterprise invoice anomaly','P2','Open','Email · Fri 16:51',
   'Invoice #20451: Notion Enterprise renewal billed at $48,000 vs $4,800 last year - a 10x jump with no explanation in the email body. Auto-pay is armed.',
   'Halt auto-pay, run root-cause, escalate to the Head of Product & Eng with a recommendation before the payment window closes.',
   2,null,4, now() - interval '64 hours', now() + interval '72 hours', false),
  ('INC-2050','Admissions deadline - competing-offer candidate','P1','Open','Admissions queue · Mon 09:00',
   'Two course-owner reviews are pending. One candidate has a competing offer and must decide tomorrow; emailed at 07:00 leaning to the competitor but open to BlueDot if she hears back today. Both are clear yeses on rubric.',
   'Approve both today; send the competing-offer candidate her acceptance before end of day.',
   0,null,4, now() - interval '1 hour', now() + interval '8 hours', false),
  ('INC-2051','Medical deferral request - Cohort 9','P2','Open','Email · Sun 22:14',
   'Marcus Doyle (C9, week 4) diagnosed with mononucleosis, signed off 4-6 weeks. Requests deferral to the next round.',
   'Approve deferral via the standard path; hold his place for the next round; send confirmation.',
   0,'C9',4, now() - interval '11 hours', now() + interval '48 hours', false);

insert into monitors (id, name, description, rule_key, severity, enabled) values
  ('MON-EMAIL','Welcome-email delivery','Flags any cohort whose welcome-email delivery is below 100%.','email_delivery','P1',true),
  ('MON-PULSE','Pulse collapse','Flags any cohort whose pulse dropped more than 1.0 week-on-week.','pulse_drop','P0',true),
  ('MON-INVOICE','Invoice variance','Flags vendor invoices more than 2x their trailing baseline.','invoice_variance','P2',true),
  ('MON-COVER','Facilitator cover gap','Flags an active cohort with no facilitator for its next session.','cover_gap','P1',true),
  ('MON-ADMIT','Admissions SLA','Flags admissions decisions approaching a candidate deadline.','admissions_sla','P1',true);

insert into comms_templates (id, name, category, subject, body) values
  ('TPL-ESCALATION','Reputation threat - acknowledgement','Escalation','Re: Cohort 11 - acknowledgement and plan',
   E'Hi Sarah,\n\nThank you for raising this, and I am sorry the experience has fallen short of what we promise. You are right to expect better.\n\nHere is what we are doing, concretely:\n1. Jamie is stepping back from Cohort 11 effective immediately while we review.\n2. A senior facilitator will run your remaining sessions; you will get the schedule by tomorrow.\n3. We are reviewing the "world-class facilitators" line on our course page this week.\n\nI would value a 20-minute call to make sure the rest of your course is what you signed up for. Are you free tomorrow?\n\nWith thanks,\nCourse Operations, BlueDot'),
  ('TPL-PRESS','Press holding line','Press','Re: your piece for MIT Technology Review',
   E'Hi Hannah,\n\nThanks for reaching out and for the chance to respond.\n\nOn the record: quality at scale is the thing we watch most closely. We run weekly pulse surveys across every cohort and act on them - this week that meant moving a facilitator off a cohort within 24 hours of the signal. We would rather catch and fix than look away.\n\nHappy to share more on background. Best, BlueDot'),
  ('TPL-WELCOME','Welcome pack (manual)','Onboarding','Your BlueDot cohort starts soon - welcome pack inside',
   E'Hi,\n\nApologies this is reaching you late - here is everything you need for your first session.\n\n- Joining link and time (see calendar invite attached)\n- Pre-reading (30 mins) and what to prepare\n- How cohorts work and who your facilitator is\n\nSee you there. Reply here with any questions.\n\nBlueDot Course Operations'),
  ('TPL-DEFERRAL','Deferral confirmation','Lifecycle','Your deferral is confirmed',
   E'Hi Marcus,\n\nSorted - your place is held for the next round and there is nothing more you need to do now. Focus on getting well.\n\nWe will email you ~2 weeks before the next round opens. Get well soon.\n\nBlueDot Course Operations');

insert into risk_register (title, owner, severity, likelihood, status, mitigation, cohort_code) values
  ('Cohort 11 public-exposure event','Ops Lead','Critical','High','Mitigating','Written response + facilitator review by Tue EOD; comms holding line ready for press.','C11'),
  ('Facilitator quality variance across pool','Sam Dower','High','Medium','Open','Standardise feedback rubric; weekly pulse monitor now auto-flags >1.0 drops.','C11'),
  ('Silent automation failures (onboarding)','Ops Lead','High','Medium','Mitigating','Move to fail-loud monitoring; delivery monitor live; manual fallback documented.','C12'),
  ('Vendor billing anomalies','Head of Product & Eng','Medium','Medium','Open','Auto-hold invoices >2x trailing baseline; domain-capture audit on Notion.',null),
  ('Facilitator availability at short notice','Ops Lead','Medium','High','Open','Maintain 4-person backup pool + 2 Teaching Fellows; matcher tool live.',null);
