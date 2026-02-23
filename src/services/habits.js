// src/services/habits.js
import { supabase } from '../lib/supabaseClient';

export async function listHabits() {
  const { data, error } = await supabase.from('habits').select('*');
  if (error) throw error;
  return data;
}

export async function createHabit(habit) {
  const { data, error } = await supabase
    .from('habits')
    .insert([{ ...habit, id: habit.id || crypto.randomUUID() }])
    .select();
  if (error) throw error;
  return data[0];
}

export async function updateHabit(id, updates) {
  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
}

export async function deleteHabit(id) {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
