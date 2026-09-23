# SafeRoute

A platform for after-school child transportation and supervision.
A parent books one verified caregiver who picks the child up from
school, drives them to their activity, stays with them, and brings
them home. The parent follows the trip live and gets a confirmation
at handoff.

Work in progress.

## Requirements

- Node.js 24 LTS
- Docker Desktop
- npm 10+

## Getting started

```bash
npm install
cp .env.example .env
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

The app runs at http://localhost:3000.

### Deployment

`package.json` pins the Vercel build and Node.js runtime to `24.x`.
Keep **Settings → Build and Deployment → Node.js Version** set to **24.x**
as well. Deploy a new commit containing this configuration to apply it;
existing deployments keep their original runtime. Vercel manages minor
and patch updates within the selected major version.

### Useful commands

| Command | What it does |
|---|---|
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:down` | Stop the database container |
| `npm run db:reset` | Wipe the database and re-seed |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run typecheck` | Check types |

## Tech stack

TypeScript, Next.js (App Router), PostgreSQL with Prisma, Zod,
Tailwind CSS, Vitest, Playwright. Deployed on Vercel with Neon.

## Architecture decisions

Design decisions and their trade-offs are documented in
[docs/adr](docs/adr).
