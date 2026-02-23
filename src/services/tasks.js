// src/services/tasks.js
import { supabase } from '../lib/supabaseClient';

// List all tasks
export async function listTasks() {
  const { data, error } = await supabase.from('tasks').select('*');
  if (error) throw error;
  return data;
}

// Create a new task
export async function createTask(task) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ ...task, id: task.id || crypto.randomUUID() }])
    .select();
  if (error) throw error;
  // The insert returns an array of inserted rows
  return data[0];
}

// Update a task by id
export async function updateTask(id, updates) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
}

// Delete a task by id
export async function deleteTask(id) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

