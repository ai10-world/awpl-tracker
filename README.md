# AWPL Team Tracker

A team performance tracking platform for AWPL network leaders. Built with **Next.js 14 App Router** + **Supabase** + **Vercel**.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Auth + Database | Supabase |
| Hosting | Vercel |

---

## Phase 1 Setup — Step by Step

### 1. Run the database schema in Supabase

1. Go to your Supabase project → **SQL Editor**
2. Open `supabase-schema.sql` from this project
3. Paste the entire file and click **Run**

This creates:
- `profiles` table (users, AWPL IDs, PINs, roles)
- `teams` and `team_members` tables (Phase 2 preview)
- Row Level Security policies
- Helper functions

### 2. Set your environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Your `.env.local` already has the correct Supabase URL and anon key filled in.

### 3. Install dependencies

```bash
npm install
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel
```

In Vercel dashboard, add these environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Make yourself Platform Admin

After you create your first account through the app, run this in the Supabase SQL Editor:

```sql
update public.profiles
set role = 'platform_admin'
where awpl_id = 'YOUR_AWPL_ID_HERE';
```

---

## Project Structure

```
awpl-tracker/
├── app/
│   ├── page.tsx              ← Landing page (EN + HI toggle)
│   ├── layout.tsx            ← Root layout
│   ├── globals.css           ← Global styles + design tokens
│   ├── auth/
│   │   ├── layout.tsx        ← Auth pages wrapper
│   │   ├── login/page.tsx    ← Login (AWPL ID + password + PIN)
│   │   └── signup/page.tsx   ← Sign up
│   └── dashboard/
│       └── page.tsx          ← Protected dashboard (Phase 2+)
├── lib/
│   ├── supabase/
│   │   ├── client.ts         ← Browser Supabase client
│   │   └── server.ts         ← Server Supabase client
│   └── actions/
│       └── auth.ts           ← Server actions: signUp, logIn, logOut
├── middleware.ts              ← Route protection + session refresh
├── supabase-schema.sql       ← Run this in Supabase SQL Editor
└── .env.local                ← Your env vars (already filled in)
```

---

## How auth works

1. **Sign up**: User enters name + AWPL ID + email + password + PIN
2. Supabase creates an auth user
3. A `profiles` row is created linking the auth user to their AWPL ID
4. **Account reconnect**: If someone signs up with the same AWPL ID again, they're reconnected to their existing profile — no duplicates
5. **Log in**: User enters AWPL ID → we look up their email → verify PIN → sign in with email+password
6. **Session**: Supabase handles JWT session. Middleware refreshes it automatically.
7. **Route protection**: `/dashboard` and other protected routes redirect to login if no session

---

## Build Plan

| Phase | Days | Status |
|---|---|---|
| Phase 1 — Foundation & Auth | Days 1–5 | ✅ Done |
| Phase 2 — Teams & Roles | Days 6–10 | Next |
| Phase 3 — Core Tracking | Days 11–17 | Upcoming |
| Phase 4 — Notifications & Polish | Days 18–22 | Upcoming |
