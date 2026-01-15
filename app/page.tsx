import { redirect } from 'next/navigation';
import { MonthYearSelectorWithSuspense } from '@/components/calendar/month-year-selector';
import { MonthCalendar } from '@/components/calendar/month-calendar';
import { getTimeEntriesForMonth } from '@/app/actions/time-entries';
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
  
  // Check if we're viewing the current month
  const isCurrentMonth = month === currentMonth && year === currentYear;
  const todayDate = today.getDate();
  
  // Fetch time entries for the selected month
  const { entries: timeEntries } = await getTimeEntriesForMonth(month, year);

  // Helper function to calculate duration in minutes
  const calculateDuration = (startTime: string, endTime: string): number => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;
    return endTotal - startTotal;
  };

  // Helper function to format date as YYYY-MM-DD for comparison
  const formatDateString = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Create a map of date strings to time entries
  const entriesByDate = new Map<string, TimeEntryWithRelations[]>();
  if (timeEntries) {
    for (const entry of timeEntries) {
      const dateStr = entry.date;
      if (!entriesByDate.has(dateStr)) {
        entriesByDate.set(dateStr, []);
      }
      
      // Transform the entry to match the expected type structure
      const transformedEntry: TimeEntryWithRelations = {
        id: entry.id,
        user_id: entry.user_id,
        project_id: entry.project_id,
        date: entry.date,
        start_time: entry.start_time,
        end_time: entry.end_time,
        created_at: entry.created_at,
        projects: entry.projects
          ? {
              name: entry.projects.name,
              clients: entry.projects.clients
                ? {
                    name: entry.projects.clients.name,
                  }
                : undefined,
            }
          : undefined,
      };
      
      entriesByDate.get(dateStr)!.push(transformedEntry);
    }
  }

  // Generate days array with time entries
  const days: DayData[] = [];
  for (let day = 1; day <= (isCurrentMonth ? todayDate : daysInMonth); day++) {
    const dayDate = new Date(year, month, day);
    const dateStr = formatDateString(dayDate);
    const entries = entriesByDate.get(dateStr) || [];
    
    // Calculate total minutes for the day
    const totalMinutes = entries.reduce((sum, entry) => {
      return sum + calculateDuration(entry.start_time, entry.end_time);
    }, 0);

    days.push({
      date: dayDate,
      timeEntries: entries,
      totalMinutes,
    });
  }

  const monthName = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate total hours for the month
  const totalMinutes = days.reduce((sum, day) => sum + day.totalMinutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const formatTotalHours = () => {
    if (totalHours === 0 && remainingMinutes === 0) return '0h';
    if (totalHours === 0) return `${remainingMinutes}m`;
    if (remainingMinutes === 0) return `${totalHours}h`;
    return `${totalHours}h ${remainingMinutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pt-24">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Month Year Selector */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <MonthYearSelectorWithSuspense selectedMonth={month} selectedYear={year} />
        </div>

        {/* Calendar Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {monthName}
          </h1>
          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Hours</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              {formatTotalHours()}
            </p>
          </div>
        </div>

        {/* Calendar View */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <MonthCalendar days={days} />
        </div>
      </div>
    </div>
  );
}