'use client';

import { useState } from 'react';
import type { Tables } from '@/lib/supabase/types';
import { DocumentPlusIcon } from '@heroicons/react/24/solid';

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
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

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

  const handleAddClick = (dayDate: Date) => {
    const dayKey = dayDate.toISOString();
    setEditingDay(dayKey);
    setStartTime('');
    setEndTime('');
  };

  const handleCancel = () => {
    setEditingDay(null);
    setStartTime('');
    setEndTime('');
  };

  const handleAccept = () => {
    // TODO: Validate times and save to Supabase
    // For now, just close the form
    console.log('Accept clicked', { startTime, endTime, day: editingDay });
    handleCancel();
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

                {editingDay === day.date.toISOString() ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
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
                          className="w-20 px-2 py-1 text-sm font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500"
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
                          className="w-20 px-2 py-1 text-sm font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAccept}
                      className="px-3 py-1.5 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-sm font-medium"
                      aria-label="Accept time entry"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                      aria-label="Cancel time entry"
                    >
                      Cancel
                    </button>
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
  );
}
