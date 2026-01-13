'use client';

import { useState } from 'react';

interface MonthYearSelectorProps {
  selectedMonth: number; // 0-11 (JavaScript Date month)
  selectedYear: number
}

export function MonthYearSelector({
  selectedMonth,
  selectedYear
}: MonthYearSelectorProps) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      onMonthYearChange(11, selectedYear - 1);
    } else {
      onMonthYearChange(selectedMonth - 1, selectedYear);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      onMonthYearChange(0, selectedYear + 1);
    } else {
      onMonthYearChange(selectedMonth + 1, selectedYear);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onMonthYearChange(parseInt(e.target.value), selectedYear);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onMonthYearChange(selectedMonth, parseInt(e.target.value));
  };

  // Generate year options (current year ± 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  return (
    <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={handlePreviousMonth}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <svg
            className="w-5 h-5 text-slate-600 dark:text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 cursor-pointer"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 cursor-pointer"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <svg
            className="w-5 h-5 text-slate-600 dark:text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <button
        onClick={() => {
          const today = new Date();
          onMonthYearChange(today.getMonth(), today.getFullYear());
        }}
        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        Today
      </button>
    </div>
  );
}
