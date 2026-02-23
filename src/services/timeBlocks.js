// src/services/timeBlocks.js
import { supabase } from '../lib/supabaseClient';

export async function listTimeBlocks() {
  const { data, error } = await supabase.from('time_blocks').select('*');
  if (error) throw error;
  return data;
}

export async function createTimeBlock(timeBlock) {
  const { data, error } = await supabase
    .from('time_blocks')
    .insert([{ ...timeBlock, id: timeBlock.id || crypto.randomUUID() }])
    .select();
  if (error) throw error;
  return data[0];
}

export async function updateTimeBlock(id, updates) {
  const { data, error } = await supabase
    .from('time_blocks')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
}

export async function deleteTimeBlock(id) {
  const { error } = await supabase
    .from('time_blocks')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
