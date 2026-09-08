import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export interface ButtonRow {
  id: string;
  label: string;
  url: string;
  category: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export async function create(
  supabase: SupabaseClient,
  { label, url, category }: { label: string; url: string; category: string }
) {
  return supabase.from("buttons").insert({ label, url, category }).select().single();
}

export async function list(
  supabase: SupabaseClient,
  { category }: { category?: string | null } = {}
) {
  let query = supabase.from("buttons").select("*").order("position");
  if (category) query = query.eq("category", category);
  return query;
}

export async function update(
  supabase: SupabaseClient,
  id: string,
  { label, url }: { label: string; url: string }
) {
  return supabase.from("buttons").update({ label, url }).eq("id", id).select().single();
}

export async function remove(supabase: SupabaseClient, id: string) {
  return supabase.from("buttons").delete().eq("id", id).select().single();
}