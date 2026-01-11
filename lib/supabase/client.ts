'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

/**
 * Creates a Supabase client for use in Client Components.
 * Uses createBrowserClient from @supabase/ssr for proper cookie-based
 * authentication that works with Next.js App Router server components.
 * 
 * @returns Typed Supabase client instance
 */
export function createSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
