"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInWithPassword(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  redirect("/");
}

export async function signInDemo(role: "ops" | "management") {
  const supabase = createSupabaseServerClient();
  const email =
    role === "management"
      ? process.env.DEMO_MGMT_EMAIL!
      : process.env.DEMO_OPS_EMAIL!;
  const password =
    role === "management"
      ? process.env.DEMO_MGMT_PASSWORD!
      : process.env.DEMO_OPS_PASSWORD!;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  redirect(role === "management" ? "/cockpit" : "/");
}

export async function signOut() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
