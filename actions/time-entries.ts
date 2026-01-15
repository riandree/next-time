'use server';

import { createSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { TablesInsert } from '@/lib/supabase/types';

export async function deleteTimeEntry(timeEntryId : string) {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.from('time_entries').delete().eq('id', timeEntryId);
	
  if (error) {
    return { error: error.message || 'Failed to delete time entry' };
  }

  revalidatePath('/');
  return { success: true };
}

export async function createTimeEntry(
  projectId: string,
  date: string,
  startTime: string,
  endTime: string
) {
  const supabase = await createSupabaseClient();

  // Validate inputs
  if (!projectId || !date || !startTime || !endTime) {
    return { error: 'All fields are required' };
  }

  // Validate time format (HH:MM)
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return { error: 'Invalid time format. Use HH:MM format.' };
  }

  // Validate that end time is after start time
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const startTotal = startHours * 60 + startMinutes;
  const endTotal = endHours * 60 + endMinutes;

  if (endTotal <= startTotal) {
    return { error: 'End time must be after start time' };
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return { error: 'Invalid date format. Use YYYY-MM-DD format.' };
  }

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Authentication required' };
  }

  // Insert time entry
  const timeEntry: TablesInsert<'time_entries'> = {
    project_id: projectId,
    date,
    start_time: startTime,
    end_time: endTime,
    user_id: user.id,
  };

  const { error } = await supabase.from('time_entries').insert(timeEntry);

  if (error) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      return {
        error: 'A time entry with the same project, date, and times already exists',
      };
    }
    return { error: error.message || 'Failed to create time entry' };
  }

  // Revalidate the page to show the new entry
  revalidatePath('/');

  return { success: true };
}

export async function getActiveProjects() {
  const supabase = await createSupabaseClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Authentication required', projects: [] };
  }

  // Fetch active projects with client information
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, clients(id, name)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('name');

  if (error) {
    return { error: error.message || 'Failed to fetch projects', projects: [] };
  }

  return { projects: data || [] };
}

export async function getTimeEntriesForMonth(month: number, year: number) {
  const supabase = await createSupabaseClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Authentication required', entries: [] };
  }

  // Calculate date range for the month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

  // Fetch time entries for the month with project and client information
  const { data, error } = await supabase
    .from('time_entries')
    .select(
      `
      *,
      projects (
        id,
        name,
        clients (
          id,
          name
        )
      )
    `
    )
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    return { error: error.message || 'Failed to fetch time entries', entries: [] };
  }

  return { entries: data || [] };
}
