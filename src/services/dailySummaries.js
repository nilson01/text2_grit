// src/services/dailySummaries.js
import { supabase } from "../lib/supabaseClient";

export async function listDailySummaries() {
  const { data, error } = await supabase.from("daily_summaries").select("*");
  if (error) throw error;
  return data;
}

export async function createDailySummary(summary) {
  const { data, error } = await supabase
    .from("daily_summaries")
    .insert([{ ...summary, id: summary.id || crypto.randomUUID() }])
    .select();

  if (error) throw error;
  return data[0];
}

export async function updateDailySummary(id, updates) {
  const { data, error } = await supabase
    .from("daily_summaries")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
}

export async function deleteDailySummary(id) {
  const { error } = await supabase.from("daily_summaries").delete().eq("id", id);
  if (error) throw error;
}