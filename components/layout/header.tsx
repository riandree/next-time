import { createSupabaseClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/auth/logout-button';

export async function Header() {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Only show header (with logout) if user is authenticated
  if (!user) {
    return null;
  }

  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Next Time
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Time recording for freelance projects
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
