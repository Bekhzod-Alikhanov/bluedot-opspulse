// Quick connectivity + schema check. Run: node scripts/check-db.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Minimal .env.local parser (no dependency on dotenv)
const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const tables = [
  "rounds", "round_metrics", "cohorts", "incidents", "backups",
  "monitors", "alerts", "comms_templates", "risk_register", "actions_log", "profiles",
];

let ok = true;
for (const t of tables) {
  const { count, error } = await supabase
    .from(t)
    .select("*", { count: "exact", head: true });
  if (error) {
    console.log(`  ✗ ${t.padEnd(16)} ERROR: ${error.message}`);
    ok = false;
  } else {
    console.log(`  ✓ ${t.padEnd(16)} ${count} rows`);
  }
}
console.log(ok ? "\nDB OK" : "\nDB has issues (did the schema run?)");
process.exit(ok ? 0 : 1);
