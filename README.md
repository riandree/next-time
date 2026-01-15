# Next Time

**Next Time** is a very simple time tracking application designed for freelancers to record and manage their work hours across multiple projects and clients. The application provides a calendar-based interface for viewing and adding time entries, with support for organizing work by clients and projects.

## Overview

Next Time is built with Next.js 16 (App Router) and uses Supabase for authentication and database management. The application allows users to:

- Track time entries with start and end times for specific projects
- Organize work by clients and projects
- View time entries in a monthly calendar view
- Filter weekends (show only when they have entries or when explicitly enabled)
- See monthly totals of tracked hours
- Navigate between months and years

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **React**: 19.2.3
- **Language**: TypeScript 5
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security)
- **Styling**: Tailwind CSS 4
- **Icons**: Heroicons 2.2.0
- **Fonts**: Geist Sans & Geist Mono (via Next.js)

## Project Structure

```
next-time/
├── actions/                # Server actions
│   ├── time-entries.ts     # Time entry CRUD operations
│   └── clients.ts         # Client CRUD operations
├── app/
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── layout.tsx          # Root layout with Header
│   ├── page.tsx           # Main calendar page
│   └── globals.css         # Global styles
├── components/
│   ├── auth/
│   │   └── logout-button.tsx
│   ├── calendar/
│   │   ├── month-calendar.tsx      # Main calendar component
│   │   └── month-year-selector.tsx # Month/year navigation
│   └── layout/
│       └── header.tsx               # App header with logo
├── lib/
│   └── supabase/
│       ├── client.ts       # Client-side Supabase client
│       ├── server.ts       # Server-side Supabase client
│       ├── middleware.ts   # Auth middleware helpers
│       └── types.ts        # Generated database types
├── middleware.ts           # Next.js middleware for auth
└── misc/
    └── ddl.sql             # Database schema
```

## Database Schema

The application uses four main tables with Row Level Security (RLS) enabled:

### Tables

1. **clients** - Client organizations
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users)
   - `name` (TEXT)
   - `created_at` (TIMESTAMPTZ)

2. **projects** - Projects belonging to clients
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users)
   - `client_id` (UUID, foreign key to clients)
   - `name` (TEXT)
   - `status` (TEXT: 'active' | 'completed')
   - `start_date` (DATE, nullable)
   - `end_date` (DATE, nullable)
   - `created_at` (TIMESTAMPTZ)

3. **time_entries** - Time tracking records
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users)
   - `project_id` (UUID, foreign key to projects)
   - `date` (DATE)
   - `start_time` (TIME)
   - `end_time` (TIME)
   - `created_at` (TIMESTAMPTZ)
   - Constraint: `end_time > start_time`
   - Unique constraint on: `(user_id, project_id, date, start_time, end_time)`

4. **daily_notes** - Notes for projects on specific days (schema exists, not yet implemented in UI)
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users)
   - `project_id` (UUID, foreign key to projects)
   - `date` (DATE)
   - `content` (TEXT, nullable)
   - `created_at` (TIMESTAMPTZ)
   - Unique constraint on: `(user_id, project_id, date)`

### Security

All tables have Row Level Security (RLS) enabled. Users can only access their own data (filtered by `user_id = auth.uid()`). Policies exist for SELECT, INSERT, UPDATE, and DELETE operations.

## Key Features

### Calendar View
- Monthly calendar display showing days with time entries
- Color coding:
  - **Gray/Yellow border**: Current day
  - **Green background**: Days with time entries
  - **Amber background**: Days without time entries (warning)
- Weekend filtering: Hide weekends unless they have entries or "Show weekends" is checked
- Fixed-width weekday column for vertical alignment of time entries

### Time Entry Management
- Add time entries with project selection, start time, and end time
- Automatic validation:
  - Time format (HH:MM)
  - End time must be after start time
  - Project selection required
- Time entries display with:
  - Time range (start - end)
  - Project name
  - Client name (if available)
  - Duration (hours and minutes)
- Daily totals and monthly totals displayed

### Navigation
- Month/year selector for navigating between months
- Prevents navigation to future months
- URL-based state (`?month=X&year=YYYY`)

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm, yarn, pnpm, or bun
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd next-time
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
   - Run the SQL script in `misc/ddl.sql` in your Supabase SQL editor
   - This creates all tables, indexes, and RLS policies

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Required environment variables (in `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

## Core Concepts for Developers

### Authentication Flow

1. **Middleware** (`middleware.ts`): Handles session refresh and route protection
   - Redirects unauthenticated users to `/login`
   - Redirects authenticated users away from `/login` and `/signup`
   - Uses `@supabase/ssr` for cookie-based session management

2. **Server Components**: Most components are Server Components by default
   - Use `createSupabaseClient()` from `lib/supabase/server.ts` for database queries
   - Access user via `await supabase.auth.getUser()`

3. **Client Components**: Marked with `'use client'` directive
   - Used for interactive UI (forms, state management)
   - Use `createSupabaseClient()` from `lib/supabase/client.ts` for client-side operations

### Server Actions

Server actions are defined in `actions/`:
- `actions/time-entries.ts`:
  - `createTimeEntry()` - Creates a new time entry with validation
  - `getActiveProjects()` - Fetches active projects with client information
  - `getTimeEntriesForMonth()` - Fetches all time entries for a given month/year
  - `deleteTimeEntry()` - Deletes a time entry
- `actions/clients.ts`:
  - `getClients()` - Fetches all clients for the user
  - `createClient()` - Creates a new client
  - `updateClient()` - Updates an existing client
  - `deleteClient()` - Deletes a client

All server actions:
- Use `'use server'` directive
- Validate inputs
- Use RLS-protected Supabase queries
- Revalidate paths after mutations using `revalidatePath()`

### Data Flow

1. **Page Load** (`app/page.tsx`):
   - Reads `month` and `year` from URL search params
   - Fetches time entries via `getTimeEntriesForMonth()`
   - Groups entries by date and calculates totals
   - Passes data to `MonthCalendar` component

2. **Adding Time Entry**:
   - User clicks "+" button on a day
   - Component fetches active projects
   - User fills form (project, start time, end time)
   - On "Accept", calls `createTimeEntry()` server action
   - Server action validates and inserts into database
   - Page refreshes via `router.refresh()` to show new entry

### Styling Approach

- **Tailwind CSS 4** with utility classes
- **Dark mode** support via `dark:` prefix
- **Responsive design** with mobile-first approach
- **Color scheme**: Slate for base colors, with green/amber/yellow for status indicators

### Type Safety

- Database types are generated in `lib/supabase/types.ts`
- Use `Tables<'table_name'>` for type-safe database access
- Server actions return typed results with error handling

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Supabase Documentation](https://supabase.com/docs) - learn about Supabase features
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

**Note**: Remember to set your environment variables in your Vercel project settings.
