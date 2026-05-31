// Restore the demo to a pristine state. Run: node scripts/reset-data.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const hoursAgo = (h) => new Date(Date.now() - h * 3.6e6).toISOString();
const hoursAhead = (h) => new Date(Date.now() + h * 3.6e6).toISOString();

// 1. Clear transient tables
await sb.from("alerts").delete().neq("id", 0);
await sb.from("assignments").delete().neq("id", 0);
await sb.from("actions_log").delete().neq("id", 0);
await sb.from("monitors").update({ last_run: null, last_status: null }).neq("id", "");

// 2. Reset incidents to Open + refresh SLA windows
const incidents = [
  ["INC-2041", -34, 33], ["INC-2038", -3, 80], ["INC-2042", -1, 7],
  ["INC-2045", -46, 33], ["INC-2039", -10, 14], ["INC-2047", -64, 72],
  ["INC-2050", -1, 8], ["INC-2051", -11, 48],
];
for (const [id, raised, due] of incidents) {
  await sb.from("incidents").update({
    status: "Open", resolved_at: null, resolved_by: null, assignee: null,
    raised_at: hoursAgo(-raised), sla_due: hoursAhead(due),
  }).eq("id", id);
}

// 3. Reset cohorts that the demo mutates
await sb.from("cohorts").update({ risk: "Amber", headline: "Facilitator down with flu as of Monday AM. Thursday 6-8pm session needs cover." }).eq("id", 10);
await sb.from("cohorts").update({ risk: "Red", stabilized: false, headline: "SEVERE: pulse collapsed 4.5 to 2.1. Public-exposure threat (Tue), press inquiry, culture complaint." }).eq("id", 11);
await sb.from("cohorts").update({ risk: "Red", onboarding_status: "Failed (0/12 sent)", email_delivery_pct: 0, transfer_requests: 5, headline: "Onboarding automation failed silently (0/12 welcome emails). 5 active transfer requests." }).eq("id", 12);

// 4. Reset backup availability
await sb.from("backups").update({ status: "Available" }).in("id", ["BF-01", "BF-02", "BF-03", "TF-01"]);
await sb.from("backups").update({ status: "Busy" }).in("id", ["BF-04", "TF-02"]);

const { count } = await sb.from("incidents").select("*", { count: "exact", head: true }).eq("status", "Open");
console.log(`Reset complete. ${count} open incidents, alerts cleared, cohorts pristine.`);
