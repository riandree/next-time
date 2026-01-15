'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Tables } from '@/lib/supabase/types';
import { DocumentPlusIcon } from '@heroicons/react/24/solid';
import { createTimeEntry, getActiveProjects } from '@/app/actions/time-entries';

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

interface Project {
  id: string;
  name: string;
  clients: {
    id: string;
    name: string;
  } | null;
}

export function MonthCalendar({ month, year, days }: MonthCalendarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWeekends, setShowWeekends] = useState(false);

  // Normalize time input: accepts both "0900" and "09:00" formats
  const normalizeTimeInput = (input: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');
    
    if (digits.length === 4) {
      const hours = digits.slice(0, -2).padStart(2, '0');
      const minutes = digits.slice(-2).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    return input;
  };

  const handleTimeInputChange = (
    value: string,
    setter: (value: string) => void
  ) => {
    const normalized = normalizeTimeInput(value);
    setter(normalized);
  };

  const handleAddClick = async (dayDate: Date) => {
    const dayKey = dayDate.toISOString();
    setEditingDay(dayKey);
    setStartTime('');
    setEndTime('');
    setProjectId('');
    setError(null);
    setIsLoadingProjects(true);

    // Fetch active projects
    const result = await getActiveProjects();
    setIsLoadingProjects(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.projects && result.projects.length > 0) {
      setProjects(result.projects);
      // Auto-select first project if available
      setProjectId(result.projects[0].id);
    } else {
      setError('No active projects found. Please create a project first.');
    }
  };

  const handleCancel = () => {
    setEditingDay(null);
    setStartTime('');
    setEndTime('');
    setProjectId('');
    setError(null);
  };

  const handleAccept = async () => {
    if (!editingDay) return;

    // Validate inputs
    if (!projectId) {
      setError('Please select a project');
      return;
    }

    if (!startTime || !endTime) {
      setError('Please enter both start and end times');
      return;
    }

    // Validate time format
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      setError('Invalid time format. Use HH:MM format (e.g., 09:00)');
      return;
    }

    // Validate that end time is after start time
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;

    if (endTotal <= startTotal) {
      setError('End time must be after start time');
      return;
    }

    setError(null);

    // Format date as YYYY-MM-DD
    const dayDate = new Date(editingDay);
    const dateString = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;

    startTransition(async () => {
      const result = await createTimeEntry(projectId, dateString, startTime, endTime);

      if (result.error) {
        setError(result.error);
      } else {
        // Success - refresh the page to show the new entry
        handleCancel();
        router.refresh();
      }
    });
  };

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

  const isWeekend = (date: Date) => {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  };

  // Filter days: show weekends only if showWeekends is true OR if they have time entries
  const filteredDays = days.filter((day) => {
    if (isWeekend(day.date)) {
      return showWeekends || day.timeEntries.length > 0;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Show Weekends Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="show-weekends"
          checked={showWeekends}
          onChange={(e) => setShowWeekends(e.target.checked)}
          className="w-4 h-4 text-slate-600 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 focus:ring-offset-0 cursor-pointer"
        />
        <label
          htmlFor="show-weekends"
          className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
        >
          Show weekends
        </label>
      </div>

      <div className="space-y-2">
        {filteredDays.map((day) => {
        const dayOfWeek = day.date.toLocaleDateString('en-US', { weekday: 'long' });
        const dayNumber = day.date.getDate();
        const isCurrentDay = isToday(day.date);
        const hasEntries = day.timeEntries.length > 0;
        const hasNoEntries = day.timeEntries.length === 0;

        return (
          <div
            key={day.date.toISOString()}
            className={`rounded-lg border ${
              isCurrentDay
                ? 'bg-slate-100 dark:bg-slate-700/50 border-yellow-400 dark:border-yellow-600 shadow-md'
                : hasEntries
                  ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700'
                  : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50'
            } p-4 hover:shadow-sm transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex flex-col w-24 flex-shrink-0">
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

                <div className="flex-1 min-w-0">
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

                {editingDay === day.date.toISOString() ? (
                  <div className="flex flex-col gap-3">
                    {error && (
                      <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded border border-red-200 dark:border-red-800">
                        {error}
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-500 dark:text-slate-400">
                            Project
                          </label>
                          <select
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            disabled={isLoadingProjects || isPending}
                            className="px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
                          >
                            {isLoadingProjects ? (
                              <option>Loading...</option>
                            ) : (
                              projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                  {project.name}
                                  {project.clients ? ` (${project.clients.name})` : ''}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-500 dark:text-slate-400">
                            Start
                          </label>
                          <input
                            type="text"
                            value={startTime}
                            onChange={(e) =>
                              handleTimeInputChange(e.target.value, setStartTime)
                            }
                            placeholder="09:00"
                            disabled={isPending}
                            className="w-20 px-2 py-1 text-sm font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            autoFocus
                          />
                        </div>
                        <span className="text-slate-400 dark:text-slate-500 mt-5">-</span>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-500 dark:text-slate-400">
                            End
                          </label>
                          <input
                            type="text"
                            value={endTime}
                            onChange={(e) =>
                              handleTimeInputChange(e.target.value, setEndTime)
                            }
                            placeholder="17:00"
                            disabled={isPending}
                            className="w-20 px-2 py-1 text-sm font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAccept}
                        disabled={isPending || isLoadingProjects || !projectId}
                        className="px-3 py-1.5 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Accept time entry"
                      >
                        {isPending ? 'Saving...' : 'Accept'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isPending}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Cancel time entry"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAddClick(day.date)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                    aria-label={`Add time entry for ${dayOfWeek}, ${dayNumber}`}
                  >
                    <DocumentPlusIcon className="size-6" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
