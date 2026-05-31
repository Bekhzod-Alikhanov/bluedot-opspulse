-- OpsPulse v3 — operability migration. Run once in the Supabase SQL Editor.
alter table incidents add column if not exists snooze_until timestamptz;

-- Helpful index for the ranked queue.
create index if not exists incidents_status_priority_idx on incidents (status, priority);
