'use server';

import { createSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/types';

export async function getClients() {
  const supabase = await createSupabaseClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Authentication required', clients: [] };
  }

  // Fetch all clients for the user, ordered by name
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true });

  if (error) {
    return { error: error.message || 'Failed to fetch clients', clients: [] };
  }

  return { clients: data || [] };
}

export async function createClient(name: string) {
  const supabase = await createSupabaseClient();

  // Validate input
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { error: 'Client name is required' };
  }

  if (trimmedName.length > 255) {
    return { error: 'Client name must be 255 characters or less' };
  }

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Authentication required' };
  }

  // Insert client
  const client: TablesInsert<'clients'> = {
    name: trimmedName,
    user_id: user.id,
  };

  const { error } = await supabase.from('clients').insert(client);

  if (error) {
    return { error: error.message || 'Failed to create client' };
  }

  // Revalidate the clients page
  revalidatePath('/clients');

  return { success: true };
}

export async function updateClient(id: string, name: string) {
  const supabase = await createSupabaseClient();

  // Validate input
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { error: 'Client name is required' };
  }

  if (trimmedName.length > 255) {
    return { error: 'Client name must be 255 characters or less' };
  }

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Authentication required' };
  }

  // Update client (RLS will ensure user can only update their own clients)
  const update: TablesUpdate<'clients'> = {
    name: trimmedName,
  };

  const { error } = await supabase
    .from('clients')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message || 'Failed to update client' };
  }

  // Revalidate the clients page
  revalidatePath('/clients');

  return { success: true };
}

export async function deleteClient(id: string) {
  const supabase = await createSupabaseClient();

  // Validate input
  if (!id) {
    return { error: 'Client ID is required' };
  }

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Authentication required' };
  }

  // Delete client (RLS will ensure user can only delete their own clients)
  // Cascade deletion of projects and time_entries is handled by database foreign key constraints
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message || 'Failed to delete client' };
  }

  // Revalidate the clients page
  revalidatePath('/clients');

  return { success: true };
}
