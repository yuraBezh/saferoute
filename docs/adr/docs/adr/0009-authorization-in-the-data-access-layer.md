# 0009. Authorization lives in the data access layer

Date: 2026-09-01
Status: accepted

## Context

Before this change, permission checks were inconsistent. `Location` actions repeated the same ownership check, 
while `Children` had no protection at all. Any signed-in user could read any child, and the edit page loaded 
children by ID without checking ownership.

There were three possible places for permission checks:

* **Proxy**: only runs during page navigation. Server Actions can be called directly, so it cannot protect them.
* **Components**: can hide UI but cannot secure the actual operation.
* **Data access layer**: every DB read and write already goes through it, so it is the safest place.

As the app grows, duplicated checks become easy to miss. For sensitive data such as `Children’s` records, one missed 
check is a security issue.

## Decision

All database access goes through `lib/data`. Pages, components, and Server Actions do not import Prisma directly.

Each data function gets the current user and applies permission checks itself.

Reads return `null` when a record is missing or belongs to another user. 
Pages convert this to the same 404 response, so users cannot discover which IDs exist.

Writes use a single `updateMany` or `deleteMany` query with ownership included in the `where` condition. 
This avoids checking first and writing later, when permissions could change between the two operations.

Related users are fetched with `select` instead of `include`, so sensitive fields such as password hashes are never 
loaded or sent to the page.

ESLint prevents imports of `lib/prisma` from `app` and `components`, so this rule is enforced automatically.

## Consequences

New DB queries must be added to the data layer first. 
This adds some friction but keeps permission checks consistent.

Data functions depend on the current session. 
Background jobs and scheduled tasks will need a separate API with an explicit actor.

The session is cached once per render with React `cache`, avoiding repeated DB session lookups.

For rejected writes, the application cannot tell whether the record was missing or forbidden. 
This is correct for users, but later the audit log may need a separate way to distinguish these cases.
