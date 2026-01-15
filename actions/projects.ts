'use server';

import { createSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/types';

export async function getProjects() {
  const supabase = await createSupabaseClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Authentication required', projects: [] };
  }

  // Fetch all projects with client information, ordered by name
  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(id, name)')
    .eq('user_id', user.id)
    .order('name', { ascending: true });

  if (error) {
    return { error: error.message || 'Failed to fetch projects', projects: [] };
  }

  return { projects: data || [] };
}

export async function getProjectsByClient(clientId?: string) {
  const supabase = await createSupabaseClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Authentication required', projects: [] };
  }

  // Build query
  let query = supabase
    .from('projects')
    .select('*, clients(id, name)')
    .eq('user_id', user.id);

  // Filter by client if provided
  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query.order('name', { ascending: true });

  if (error) {
    return { error: error.message || 'Failed to fetch projects', projects: [] };
  }

  return { projects: data || [] };
}

export async function createProject(name: string, clientId: string) {
  const supabase = await createSupabaseClient();

  // Validate input
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { error: 'Project name is required' };
  }

  if (trimmedName.length > 255) {
    return { error: 'Project name must be 255 characters or less' };
  }

  if (!clientId) {
    return { error: 'Client is required' };
  }

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Authentication required' };
  }

  // Insert project (default status to 'completed')
  const project: TablesInsert<'projects'> = {
    name: trimmedName,
    client_id: clientId,
    user_id: user.id,
    status: 'completed',
  };

  const { error } = await supabase.from('projects').insert(project);

  if (error) {
    return { error: error.message || 'Failed to create project' };
  }

  // Revalidate the projects page
  revalidatePath('/projects');

  return { success: true };
}

export async function updateProject(id: string, name: string) {
  const supabase = await createSupabaseClient();

  // Validate input
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { error: 'Project name is required' };
  }

  if (trimmedName.length > 255) {
    return { error: 'Project name must be 255 characters or less' };
  }

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Authentication required' };
  }

  // Update project (client cannot be changed)
  const update: TablesUpdate<'projects'> = {
    name: trimmedName,
  };

  const { error } = await supabase
    .from('projects')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message || 'Failed to update project' };
  }

  // Revalidate the projects page
  revalidatePath('/projects');

  return { success: true };
}

export async function deleteProject(id: string) {
  const supabase = await createSupabaseClient();

  // Validate input
  if (!id) {
    return { error: 'Project ID is required' };
  }

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Authentication required' };
  }

  // Delete project (RLS will ensure user can only delete their own projects)
  // Cascade deletion of time_entries is handled by database foreign key constraints
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message || 'Failed to delete project' };
  }

  // Revalidate the projects page
  revalidatePath('/projects');

  return { success: true };
}

export async function setProjectActive(id: string) {
  const supabase = await createSupabaseClient();

  // Validate input
  if (!id) {
    return { error: 'Project ID is required' };
  }

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Authentication required' };
  }

  // First, set all projects to 'completed'
  const { error: updateAllError } = await supabase
    .from('projects')
    .update({ status: 'completed' })
    .eq('user_id', user.id);

  if (updateAllError) {
    return { error: updateAllError.message || 'Failed to update projects' };
  }

  // Then, set the selected project to 'active'
  const { error: updateActiveError } = await supabase
    .from('projects')
    .update({ status: 'active' })
    .eq('id', id)
    .eq('user_id', user.id);

  if (updateActiveError) {
    return { error: updateActiveError.message || 'Failed to set project as active' };
  }

  // Revalidate the projects page and home page (since active projects affect calendar)
  revalidatePath('/projects');
  revalidatePath('/');

  return { success: true };
}
