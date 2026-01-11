import { createSupabaseClient } from '@/lib/supabase/server';

export default async function Home() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Test database connection
  let connectionStatus = 'unknown';
  let connectionError: string | null = null;
  let isAuthenticated = false;
  
  try {
    const supabase = await createSupabaseClient();
    
    // Test connection by trying to get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      // Check if it's a session/JWT error (means connected but not authenticated)
      if (authError.message.includes('session') || authError.message.includes('JWT')) {
        connectionStatus = 'connected';
        isAuthenticated = false;
      } else {
        // Real connection error
        connectionStatus = 'error';
        connectionError = authError.message;
      }
    } else {
      // Successfully connected
      connectionStatus = 'connected';
      isAuthenticated = !!user;
    }
  } catch (error) {
    connectionStatus = 'error';
    connectionError = error instanceof Error ? error.message : 'Unknown error';
  }

  const activeProject = {
    name: "Website Redesign",
    client: "Acme Corp",
  };

  const todaysTime = "0h 0m";
  const timeEntries = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Next Time
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Time recording for freelance projects
          </p>
        </header>

        {/* Database Connection Test */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
            Database Connection Test
          </h3>
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${
              connectionStatus === 'connected' 
                ? 'bg-green-500' 
                : connectionStatus === 'error' 
                ? 'bg-red-500' 
                : 'bg-yellow-500'
            }`} />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                Status: {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'error' ? 'Error' : 'Unknown'}
              </p>
              {connectionError && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {connectionError}
                </p>
              )}
              {connectionStatus === 'connected' && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Successfully connected to Supabase! {isAuthenticated ? '(Authenticated)' : '(Not logged in)'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                {formattedDate}
              </p>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                Today&apos;s Time
              </h2>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {todaysTime}
              </p>
            </div>
          </div>

          {/* Active Project Info */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Active Project
                </p>
                <p className="text-lg font-medium text-slate-900 dark:text-slate-50">
                  {activeProject.name}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {activeProject.client}
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Active
              </span>
            </div>
          </div>

          {/* Add Time Entry Button */}
          <button className="w-full py-3 px-4 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
            Add Time Entry
          </button>
        </div>

        {/* Today's Entries Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
            Today&apos;s Entries
          </h3>
          
          {timeEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                No time entries recorded today
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Click &quot;Add Time Entry&quot; to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Time entries will be rendered here */}
            </div>
          )}
        </div>

        {/* Daily Note Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
            Daily Note
          </h3>
          <textarea
            placeholder="Add notes about today's work..."
            className="w-full min-h-[120px] px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-transparent resize-none"
            disabled
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Notes are saved automatically
          </p>
        </div>
      </div>
    </div>
  );
}