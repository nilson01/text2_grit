// src/services/focusSessions.js
import { supabase } from '../lib/supabaseClient';

export async function listFocusSessions() {
  const { data, error } = await supabase.from('focus_sessions').select('*');
  if (error) throw error;
  return data;
}

export async function createFocusSession(session) {
  const { data, error } = await supabase
    .from('focus_sessions')
    .insert([{ ...session, id: session.id || crypto.randomUUID() }])
    .select();
  if (error) throw error;
  return data[0];
}

export async function updateFocusSession(id, updates) {
  const { data, error } = await supabase
    .from('focus_sessions')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
}

export async function deleteFocusSession(id) {
  const { error } = await supabase
    .from('focus_sessions')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
