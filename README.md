# AWPL Team Tracker

A team performance tracking platform for AWPL network leaders. Built with Next.js 14 App Router, Supabase, Tailwind CSS, and Vercel.

## Current Features

- AWPL ID signup and login with password plus security PIN
- Daily PIN login using AWPL ID plus PIN
- Teams, roles, member permissions, and admin views
- Daily reports with plan, follow-up, sign-up, SP, review status, streaks, and activity feed
- Database-backed AWPL Vault with PIN lock and role-based vault access
- PWA manifest and Vercel Speed Insights

## Database Setup

Run the SQL files in this order from the Supabase SQL Editor:

1. `supabase-schema.sql`
2. `reports-schema-updated.sql`
3. `streaks-schema.sql`
4. `vault-schema.sql`

The older `phase2-schema.sql` and `phase3-schema.sql` files were removed because they described outdated table shapes and could drop or recreate active tables incorrectly.

## Environment

Copy `.env.example` to `.env.local` and fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

For production, set the same values in Vercel. `NEXT_PUBLIC_APP_URL` should be your deployed app URL, for example `https://awpl-tracker-theta.vercel.app`.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Check

```bash
npm run build
```

## Make Yourself Platform Admin

After creating your first account, run:

```sql
update public.profiles
set role = 'platform_admin'
where awpl_id = 'YOUR_AWPL_ID_HERE';
```

## Vault Access Rules

- Platform admin can see all vaults.
- Team admin can see vaults linked to their teams.
- Team leader can see team vaults only when `team_members.can_view_vault = true`.
- Member can see their own personal vaults and their own team vault entries.
- `awpl_vault_permissions` supports explicit per-vault grants for future sharing UI.
