'use client';

import { createSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 border-2 border-slate-300 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-400 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      title="Sign out"
    >
      <ArrowRightOnRectangleIcon className="w-5 h-5" />
    </button>
  );
}
