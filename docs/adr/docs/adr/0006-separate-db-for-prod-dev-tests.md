# 0006. Separate databases for production, development, and tests

Date: 2026-08-25
Status: accepted

## Context

The project originally used one Neon database for both development and production.

This caused two problems:

* Running `prisma migrate dev` locally changed the same DB used by the deployed app.
* End-to-end tests could not safely reset the DB because it contained real development or production data.

## Decision

Use three separate databases:

| Purpose          | Where  | Port   |
| ---------------- | ------ | ------ |
| Production       | Neon   | remote |
| Development      | Docker | 5434   |
| End-to-end tests | Docker | 5433   |

The development and test databases run locally in Docker and can be recreated from scratch.

The production connection string exists only in Vercel environment variables and is not stored locally. 
This means commands run on a developer machine, including Prisma CLI commands, use the local Docker database by default.

Test-specific variables are stored in `.env.e2e`, including a flag that allows the test DB to be reset. 
This flag is not available in the development environment.

## Consequences

Local development no longer requires a network connection.

Migrations are tested against an empty DB after every reset, which helps detect migrations that only work with existing data.

Accessing production from a local machine now requires explicitly providing the production connection string. 
This extra step is intentional to reduce accidental changes.

There is still a risk of running destructive commands against the wrong DB. 
The reset flag helps, but the reset logic should also verify that the connection string points to a test DB.

## Open question

Vercel preview deployments still use the production DB, so code from an open pull request can modify live data.

Neon database branching could give each preview deployment its own DB, but this has not been set up yet.
