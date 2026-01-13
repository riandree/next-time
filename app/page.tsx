import { redirect } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/server';
import { MonthYearSelectorWithSuspense } from '@/components/calendar/month-year-selector';
import { MonthCalendar } from '@/components/calendar/month-calendar';
import type { Tables } from '@/lib/supabase/types';

interface HomeProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

interface TimeEntryWithRelations extends Tables<'time_entries'> {
  projects?: {
    name: string;
    clients?: {
      name: string;
    };
  };
}

interface DayData {
  date: Date;
  timeEntries: TimeEntryWithRelations[];
  totalMinutes: number;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Get month and year from URL params, default to current month/year
  const selectedMonth = params.month ? parseInt(params.month) - 1 : currentMonth; // Convert 1-12 to 0-11
  const selectedYear = params.year ? parseInt(params.year) : currentYear;
  
  // Validate the month and year - ensure they're not in the future
  let month = selectedMonth >= 0 && selectedMonth <= 11 ? selectedMonth : currentMonth;
  let year = selectedYear >= 1900 && selectedYear <= 2100 ? selectedYear : currentYear;
  
  // Check if the selected month/year is in the future
  const isFutureMonth = (m: number, y: number) => {
    if (y > currentYear) return true;
    if (y === currentYear && m > currentMonth) return true;
    return false;
  };
  
  // If future month is selected, redirect to current month
  if (isFutureMonth(month, year)) {
    redirect(`/?month=${currentMonth + 1}&year=${currentYear}`);
  }

  // Generate all days in the selected month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  const days: DayData[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      date: new Date(year, month, day),
      timeEntries: [],
      totalMinutes: 0,
    });
  }

  const monthName = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Month Year Selector */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <MonthYearSelectorWithSuspense selectedMonth={month} selectedYear={year} />
        </div>

        {/* Calendar Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {monthName}
          </h1>
        </div>

        {/* Calendar View */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <MonthCalendar month={month} year={year} days={days} />
        </div>
      </div>
    </div>
  );
}