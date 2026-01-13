import type { Tables } from '@/lib/supabase/types';
import { DocumentPlusIcon } from '@heroicons/react/24/solid'


interface TimeEntry extends Tables<'time_entries'> {
  projects?: {
    name: string;
    clients?: {
      name: string;
    };
  };
}

interface DayData {
  date: Date;
  timeEntries: TimeEntry[];
  totalMinutes: number;
}

interface MonthCalendarProps {
  month: number; // 0-11 (JavaScript Date month)
  year: number;
  days: DayData[];
}

export function MonthCalendar({ month, year, days }: MonthCalendarProps) {
  const formatTime = (timeString: string) => {
    // timeString is in format "HH:MM:SS" or "HH:MM"
    const [hours, minutes] = timeString.split(':').map(Number);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;
    return endTotal - startTotal;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="space-y-2">
      {days.map((day) => {
        const dayOfWeek = day.date.toLocaleDateString('en-US', { weekday: 'long' });
        const dayNumber = day.date.getDate();
        const isCurrentDay = isToday(day.date);

        return (
          <div
            key={day.date.toISOString()}
            className={`bg-white dark:bg-slate-800 rounded-lg border ${
              isCurrentDay
                ? 'border-slate-400 dark:border-slate-500 shadow-md'
                : 'border-slate-200 dark:border-slate-700'
            } p-4 hover:shadow-sm transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex flex-col">
                  <span
                    className={`text-sm font-medium ${
                      isCurrentDay
                        ? 'text-slate-900 dark:text-slate-50'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {dayOfWeek}
                  </span>
                  <span
                    className={`text-2xl font-bold ${
                      isCurrentDay
                        ? 'text-slate-900 dark:text-slate-50'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dayNumber}
                  </span>
                </div>

                <div className="flex-1">
                  {day.timeEntries.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No time entries
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {day.timeEntries.map((entry) => {
                        const duration = calculateDuration(entry.start_time, entry.end_time);
                        return (
                          <div
                            key={entry.id}
                            className="flex items-center gap-3 text-sm"
                          >
                            <span className="text-slate-600 dark:text-slate-400 font-mono">
                              {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                            </span>
                            <span className="text-slate-500 dark:text-slate-500">•</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                              {entry.projects?.name || 'Unknown Project'}
                            </span>
                            {entry.projects?.clients?.name && (
                              <>
                                <span className="text-slate-500 dark:text-slate-500">•</span>
                                <span className="text-slate-600 dark:text-slate-400">
                                  {entry.projects.clients.name}
                                </span>
                              </>
                            )}
                            <span className="text-slate-500 dark:text-slate-500">•</span>
                            <span className="text-slate-600 dark:text-slate-400">
                              {formatDuration(duration)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {day.totalMinutes > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {formatDuration(day.totalMinutes)}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                  aria-label={`Add time entry for ${dayOfWeek}, ${dayNumber}`}
                >
                  <DocumentPlusIcon className="size-6" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
