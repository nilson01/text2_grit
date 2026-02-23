// src/services/achievements.js
import { supabase } from "../lib/supabaseClient";

export async function listAchievements() {
  const { data, error } = await supabase.from("achievements").select("*");
  if (error) throw error;
  return data;
}

export async function createAchievement(achievement) {
  const { data, error } = await supabase
    .from("achievements")
    .insert([{ ...achievement, id: achievement.id || crypto.randomUUID() }])
    .select();

  if (error) throw error;
  return data[0];
}

export async function updateAchievement(id, updates) {
  const { data, error } = await supabase
    .from("achievements")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
}

export async function deleteAchievement(id) {
  const { error } = await supabase.from("achievements").delete().eq("id", id);
  if (error) throw error;
}