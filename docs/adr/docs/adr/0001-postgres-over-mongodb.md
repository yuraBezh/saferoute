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
2. Handoff and audit rows must not be changed after they are written.

## Decision

PostgreSQL, accessed through Prisma.

MongoDB was considered. It fits this domain better than it first looks.
It has compound unique indexes, partial unique indexes, and multi
document transactions. None of those were the deciding factor.

What decided it: foreign keys with delete policies. MongoDB has no
equivalent. Every reference check would live in the application code. That
is the easiest place to forget one.

## Consequences

Schema changes need migrations.

Delete behavior has to be chosen for every relation. The default is
not safe here. See ADR 0004.

Handoff and audit rows (`TripEvent`) are only ever inserted by the data
access layer, never updated or deleted. This is enforced by convention
in application code, not by the database.
