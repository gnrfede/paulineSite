# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start dev server (http://localhost:3000)
npm run build         # Production build — run this to catch TypeScript/lint errors
npm run lint          # ESLint check

# Database
npm run db:push       # Sync schema to DB without migrations (use for local dev)
npm run db:migrate    # Create a new named migration (use before production changes)
npm run db:seed       # Populate DB with services and working schedules
npm run db:generate   # Regenerate Prisma Client after schema changes
npm run db:studio     # Open Prisma visual DB browser
```

`DATABASE_URL` must be set in `.env.local` before any `db:*` command. For local dev: `DATABASE_URL="file:./dev.db"`.

## Architecture

### Request flow

```
Browser → Next.js Middleware (Edge) → Page/API Route (Node.js)
```

The middleware (`src/middleware.ts`) protects `/admin/*` routes using JWT from a cookie. It imports **only** from `src/lib/auth-edge.ts` — the Edge Runtime-safe module that uses only `jose`. Do not import from `src/lib/auth.ts` in middleware; that file imports `bcryptjs` and would break the Edge Runtime.

### Auth split

| File | Runtime | Exports |
|------|---------|---------|
| `src/lib/auth-edge.ts` | Edge + Node.js | `verifyAdminToken`, `COOKIE_NAME` |
| `src/lib/auth.ts` | Node.js only | `signAdminToken`, `getAdminFromCookie`, `validateAdminCredentials` |

Admin credentials are stored entirely in environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) — there is no admin user in the database. `validateAdminCredentials()` compares plain-text env vars.

### Data layer

All database access goes through the Prisma singleton in `src/lib/db.ts`. The schema uses SQLite locally and PostgreSQL in production; switch the `provider` in `prisma/schema.prisma` and re-run `db:push` when deploying.

**Important SQLite constraint:** `Booking.status` is a plain `String` field, not a Prisma `enum`. Enums are not supported in SQLite. The valid values (`PENDING`, `CONFIRMED`, `REJECTED`, `CANCELLED`) are enforced at the Zod layer in `src/lib/validations.ts` and typed in `src/types/index.ts`.

**Date/time conventions:**
- `date` fields are always stored as `"YYYY-MM-DD"` strings (not `DateTime`)
- `timeSlot` and `startTime`/`endTime` are stored as `"HH:MM"` strings
- This avoids timezone drift and simplifies SQLite queries

### Availability algorithm (`src/lib/availability.ts`)

1. Reject if the date is in `BlockedDate`
2. Look up the `Schedule` row for that day-of-week (if none or `active=false`, return `[]`)
3. Collect all `PENDING`/`CONFIRMED` bookings for the date and their service durations
4. Walk from `startTime` to `endTime` in **30-minute increments**, emitting a slot if the window `[t, t + serviceDuration)` doesn't overlap any occupied interval

The 30-minute increment is hardcoded as `slotInterval = 30`. The double-booking check at `POST /api/bookings` re-calls `getAvailableSlots` server-side before inserting to prevent races.

### Page structure

- `src/app/page.tsx` — public homepage (Server Component, composes all home sections)
- `src/app/reservar/page.tsx` — booking page (Server Component fetches services, passes to `BookingForm` Client Component)
- `src/app/mis-turnos/page.tsx` — customer booking lookup (pure Client Component)
- `src/app/admin/login/page.tsx` — admin login (Client Component)
- `src/app/admin/dashboard/layout.tsx` — wraps all dashboard pages; verifies cookie server-side and renders `AdminSidebar`

### Component conventions

- Home sections (`src/components/home/`) are all Server Components — no `"use client"` unless they need state (e.g., `Testimonials.tsx`)
- Booking components (`src/components/booking/`) are all Client Components; they fetch `/api/availability` reactively when service or date changes
- Admin dashboard pages are Client Components that fetch from API routes using `fetch()` — they are not server-rendered because they require user interaction and live updates

### Styling

Tailwind CSS with a custom palette defined in `tailwind.config.ts`:
- `teal-400` (`#6BBFB5`) — primary brand color
- `cream-100` (`#FAF9F7`) — page background
- `blush-200` (`#F8E4E0`) — secondary accent

Component classes (`btn-primary`, `btn-outline`, `input-field`, `status-badge`, `section-label`, `card`) are defined in `src/app/globals.css` as `@layer components`. Use these before writing inline Tailwind.

Fonts are loaded via `next/font/google` in `src/app/layout.tsx` and exposed as CSS variables: `--font-dancing` (script), `--font-playfair` (serif), `--font-dm-sans` (sans-serif). The Tailwind keys `font-script`, `font-serif`, `font-sans` map to these variables.

## Known gotchas

- **`next.config.ts` is not supported** in Next.js 14 — the config file is `next.config.mjs`.
- **`cookies()` from `next/headers`** is synchronous in Next.js 14 but the code uses `await cookies()` for forward compatibility with Next.js 15 — this works correctly in both.
- **Image filenames have spaces** (e.g., `inst publication 3.jpeg`) because they were copied directly from the source `Imagenes/` folder. Next.js serves them correctly; browsers URL-encode the spaces automatically.
- **`npm run db:seed` clears all existing data** before inserting — do not run in production.
