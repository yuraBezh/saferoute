# 0001. PostgreSQL over MongoDB

Date: 2026-08-10
Status: accepted

## Context

SafeRoute stores children, the adults (responsible for them), bookings,
trips, and a record of every handoff.

Two requirements drive the choice:
1. Broken references must be impossible. The database has to enforce this,
   not the application code. A trip pointing at a child who no longer
   exists is a safety problem.
2Handoff and audit rows must be impossible to change afterwards. That
   includes changes made by the application itself.

## Decision

PostgreSQL, accessed through Prisma.

MongoDB was considered. It fits this domain better than it first looks.
It has compound unique indexes, partial unique indexes, and multi
document transactions. None of those were the deciding factor.

Two things decided it.
1. Foreign keys with delete policies. MongoDB has no equivalent. Every
   reference check would live in application code. That is the easiest
   place to forget one.
2. Table level privileges. A database role can be denied UPDATE and DELETE
   on audit tables while still being allowed to insert. MongoDB has no
   comparable way to make a collection append only for the application.

## Consequences

Schema changes need migrations. Slower now, reviewable later.

Delete behaviour has to be chosen for every relation. The default is
not safe here. To be decided separately.

A GRANT alone will not make audit tables immutable, because the schema
owner bypasses table privileges. A stronger mechanism is needed. To be
decided separately.

Immutable audit records conflict with the right to erase a child's
data. To be decided separately.

Prisma hides SQL. Raw SQL will be used on purpose for map queries and
reports.
