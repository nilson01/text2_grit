// src/services/habitLogs.js
import { supabase } from "../lib/supabaseClient";

export async function listHabitLogs() {
  const { data, error } = await supabase.from("habit_logs").select("*");
  if (error) throw error;
  return data;
}

export async function createHabitLog(habitLog) {
  const { data, error } = await supabase
    .from("habit_logs")
    .insert([{ ...habitLog, id: habitLog.id || crypto.randomUUID() }])
    .select();

  if (error) throw error;
  return data[0];
}

export async function updateHabitLog(id, updates) {
  const { data, error } = await supabase
    .from("habit_logs")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
}

export async function deleteHabitLog(id) {
  const { error } = await supabase.from("habit_logs").delete().eq("id", id);
  if (error) throw error;
}