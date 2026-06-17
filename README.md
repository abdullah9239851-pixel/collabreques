# CollabRequest

CollabRequest is an Excel-like collaborative request tracker built with Next.js, PostgreSQL, Prisma, and Socket.IO.

This initial repository contains a deployable Next.js starter for Vercel. The detailed requirements and implementation plan live in the project discussion document.

## Demo Direction

- Shared company workspace
- Multiple user-facing Sheets backed by internal Dashboard entities
- Excel-like request grid
- User, Admin, and Super Admin roles
- Realtime collaboration with presence, typing indicators, and cell locks
- Demo seed users, sheets, dropdown lists, requests, and permissions

## Local Development

```bash
npm install
npm run dev
```

## Database Setup

Copy `.env.example` to `.env.local` and fill in the Supabase/PostgreSQL connection values. Then run:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Seeded demo access:

- Super Admin: `abdullah9239851@gmail.com`
- Admin: `contact.abdullah9239851@gmail.com`
- Default practice password comes from `SEED_SUPERADMIN_PASSWORD` and `SEED_ADMIN_PASSWORD`.

## Deployment

The main Next.js app is intended for Vercel. Socket.IO realtime service should run on a persistent Node.js host such as Railway, Render, or Fly.io.
