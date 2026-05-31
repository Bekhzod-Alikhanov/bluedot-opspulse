import { createSupabaseServerClient } from "./supabase/server";
import type { Profile } from "./types";

// Current authenticated user + profile (role). Returns null if signed out.
export async function getSessionProfile(): Promise<Profile | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (data) return data as Profile;
  // Fallback if the profile row is missing for any reason.
  return {
    id: user.id,
    email: user.email ?? "",
    full_name: (user.user_metadata?.full_name as string) ?? user.email ?? "",
    role: (user.user_metadata?.role as Profile["role"]) ?? "ops",
  };
}
