'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, Suspense } from 'react';

interface MonthYearSelectorProps {
  selectedMonth: number; // 0-11 (JavaScript Date month)
  selectedYear: number;
}

function MonthYearSelector({
  selectedMonth,
  selectedYear,
}: MonthYearSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateUrl = useCallback((month: number, year: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', (month + 1).toString()); // Store as 1-12 for readability
    params.set('year', year.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

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
      updateUrl(11, selectedYear - 1);
    } else {
      updateUrl(selectedMonth - 1, selectedYear);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      updateUrl(0, selectedYear + 1);
    } else {
      updateUrl(selectedMonth + 1, selectedYear);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrl(parseInt(e.target.value), selectedYear);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrl(selectedMonth, parseInt(e.target.value));
  };

  // Generate year options (current year ± 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 10 + i);

  return (
    <div className="flex items-center justify-between">
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
          updateUrl(today.getMonth(), today.getFullYear());
        }}
        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
      >
        Today
      </button>
    </div>
  );
}

// Wrapper component with Suspense for useSearchParams
export function MonthYearSelectorWithSuspense(props: MonthYearSelectorProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
      </div>
    }>
      <MonthYearSelector {...props} />
    </Suspense>
  );
}
