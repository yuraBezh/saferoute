# SafeRoute

Parents need a way to cover the gap between school pickup, after-school activities, and getting home
when they cannot make the trip themselves. SafeRoute lets a parent book one caregiver for that
route, confirm pickup with a code, and review the trip's event history. The current prototype
focuses on booking integrity and explicit handoffs: who is responsible for a child, which
transitions are allowed, and what happens when requests race or are retried.

**Live demo:** [saferoute-orcin.vercel.app](https://saferoute-orcin.vercel.app/)

## What it does

1. A parent adds a child, saves locations, and books a pickup with an optional activity stop.
2. A caregiver with verified status accepts an available booking; acceptance creates the trip
   atomically. Verification currently uses a demo flow.
3. The caregiver advances the trip from scheduled to en route to school, picked up, at activity, en
   route home, and completed.
4. The pickup form requires a six-digit code shown to a guardian authorized to approve handoff.
5. Each successful transition records an event with its actor and timestamps.
6. The parent opens the booking to see the trip status and event log; updates currently require a
   page refresh.

## Tech stack

- Node.js 24 LTS, TypeScript 5, Next.js 16.3 (App Router), React 19.2.
- PostgreSQL 17, Prisma ORM 7.9 with the PostgreSQL driver adapter.
- Auth.js 5 beta with Google OAuth, Zod 4, Tailwind CSS 4.
- Vitest 4.1 for unit tests, Playwright 1.62 for browser tests.
- Vercel and Neon for deployment; Docker Compose for local databases.

## Architecture

[Architecture decision records](docs/adr) explain the data model, integrity guarantees, and
trade-offs. Start with:

- [Accepting a booking](docs/adr/0012-accepting-a-booking.md): Serializable transactions,
  conditional updates, and bounded retries.
- [Trip lifecycle and integrity](docs/adr/0013-trip-lifecycle-and-integrity.md): enforcing one
  in-progress trip per child in PostgreSQL.
- [Trip transitions and handoff](docs/adr/0014-trip-state-transitions-and-handoff.md): the state
  machine, optimistic locking, and current idempotency limits.
- [Calendar dates](docs/adr/0005-calendar-dates-as-strings.md) and
  [booking time](docs/adr/0011-booking-lifecycle-time-and-integrity.md): separating birthdays from
  pickup instants.

## Interesting problems

**Two caregivers accept the same booking.** Both can see it as available before either commits.
Acceptance runs in a Serializable transaction; a conditional SQL `UPDATE` rechecks availability and
caregiver eligibility, and trip creation commits with it. Serialization failures (`40001` / `P2034`)
retry with a limit of three total attempts; the losing request cannot overwrite the assignment.

**One child ends up in two trips at once.** Checking availability in application code is
insufficient when two requests read the same state. PostgreSQL exclusion constraints reject
overlapping accepted bookings for either the child or caregiver; a separate partial unique index
permits only one in-progress trip per child. The latter also covers trips running beyond their
planned time: it checks actual lifecycle state, not just scheduled intervals.

**A handoff request is retried over a bad connection.** The database may have committed even though
the caregiver never received the response. Status/version checks and a unique event idempotency key
prevent a second committed transition; the status change and event are written in one transaction.
Response idempotency is still incomplete: a retry can report an error after a successful handoff.

**A birthday is a date; a pickup is a moment.** Parsing a birthday as midnight UTC can display the
previous day in a US timezone. Calendar dates stay as `YYYY-MM-DD` strings, with symmetric
conversion helpers only at the Prisma boundary. Pickup times use the pickup location's timezone to
convert to UTC and are stored as PostgreSQL `timestamptz`, so the server's timezone does not choose
the departure time.

## What is deliberately not built

GPS tracking, push notifications, payments, and production caregiver verification are outside the
current prototype. The focus is a complete booking-to-handoff flow with database-backed integrity
before adding external services and operational workflows.

## Getting started

Requirements: Node.js 24 LTS, Docker Desktop, and npm 10+.

Install dependencies and prepare the local environment:

```bash
npm install
cp .env.example .env
```

Fill in `AUTH_SECRET` (generate it with `openssl rand -base64 32`) and the Google OAuth credentials
in `.env`. Register `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI,
and set `SEED_OWNER_EMAIL` to the Google account you will use to sign in.

Start the database, apply migrations, and load demo data:

```bash
npm run db:up
npm run db:migrate
npx prisma generate
npm run db:seed
npm run dev
```

The app runs at http://localhost:3000.

### Deployment

Vercel uses `engines.node: "24.x"` from `package.json`; CI and `.nvmrc` also select Node.js 24.
Configure the production database URL, Auth.js secret, and Google OAuth credentials in Vercel, and
register the deployed origin's `/api/auth/callback/google` URL with Google. The build command
generates Prisma Client, applies committed migrations, and builds Next.js.

### Browser tests

For browser tests, prepare the separate test environment and install Chromium once:

```bash
cp .env.e2e.example .env.e2e
npx playwright install chromium
npm run test:e2e
```

The test runner starts and resets the dedicated E2E database on port 5433, seeds authenticated
sessions, and starts the app at `http://127.0.0.1:3100`. Run Playwright through the npm script so
these sessions are available.

### Useful commands

| Command             | What it does                  |
| ------------------- | ----------------------------- |
| `npm run db:studio` | Open Prisma Studio            |
| `npm run db:down`   | Stop the database container   |
| `npm run db:reset`  | Wipe the database and re-seed |
| `npm test`          | Run unit tests                |
| `npm run test:e2e`  | Run end-to-end tests          |
| `npm run typecheck` | Check types                   |
