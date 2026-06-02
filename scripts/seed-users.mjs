// Create the two demo auth users. Idempotent. Run: node scripts/seed-users.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const users = [
  {
    email: env.DEMO_OPS_EMAIL,
    password: env.DEMO_OPS_PASSWORD,
    full_name: "Alex Ops (Course Operations Lead)",
    role: "ops",
  },
  {
    email: env.DEMO_MGMT_EMAIL,
    password: env.DEMO_MGMT_PASSWORD,
    full_name: "Leadership (demo)",
    role: "management",
  },
];

// Page through existing users so re-runs update instead of erroring.
const { data: existingList } = await admin.auth.admin.listUsers({ perPage: 1000 });
const byEmail = new Map((existingList?.users ?? []).map((u) => [u.email, u]));

for (const u of users) {
  const existing = byEmail.get(u.email);
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, role: u.role },
    });
    await admin.from("profiles").upsert({
      id: existing.id,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
    });
    console.log(`  ↻ updated ${u.email} (${u.role})`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, role: u.role },
    });
    if (error) {
      console.log(`  ✗ ${u.email}: ${error.message}`);
      continue;
    }
    // Ensure profile role (trigger creates it; upsert guarantees role is set).
    await admin.from("profiles").upsert({
      id: data.user.id,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
    });
    console.log(`  ✓ created ${u.email} (${u.role})`);
  }
}

const { count } = await admin.from("profiles").select("*", { count: "exact", head: true });
console.log(`\nprofiles: ${count} rows`);
