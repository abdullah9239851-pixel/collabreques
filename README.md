# CollabRequest

CollabRequest is an Excel-like collaborative request tracker built with Next.js, PostgreSQL, Prisma, and Socket.IO.

This initial repository contains a deployable Next.js starter for Vercel. The detailed requirements and implementation plan live in the project discussion document.

## Demo Direction

- Shared company workspace
- Multiple user-facing Sheets backed by internal Dashboard entities
- Excel-like request grid
- User, Admin, and Super Admin roles
- Realtime collaboration with presence, typing indicators, and cell locks
- Demo seed users and data planned for the Prisma implementation

## Local Development

```bash
npm install
npm run dev
```

## Deployment

The main Next.js app is intended for Vercel. Socket.IO realtime service should run on a persistent Node.js host such as Railway, Render, or Fly.io.
