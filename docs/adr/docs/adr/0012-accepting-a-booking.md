# 0012. Accepting a booking

Date: 2026-09-10

Status: accepted

## Context

A pending booking is visible to every verified caregiver. Accepting it commits one caregiver to one
child at one time.

Acceptance must prevent three races:

- Two caregivers accepting the same booking.
- A child having overlapping accepted bookings.
- A caregiver accepting overlapping bookings.

ADR 0011 identified the first two as future requirements because acceptance had not yet been
implemented.

## Decision

Acceptance runs in a Serializable transaction with automatic retries.

Three independent protections enforce the rules:

1. All reads and conflict checks use the transaction client, keeping them in the same Postgres
   snapshot and conflict tracking.
2. The booking is updated with a single raw SQL statement rather than Prisma's `updateMany`, because
   it has to re-check several conditions atomically in one `WHERE`: the booking must still be
   `PENDING` and unassigned, the caregiver must still be verified and hold the `CAREGIVER` role, and
   the caregiver must not be a guardian of the child. If zero rows are updated, acceptance fails.
3. Serializable isolation detects concurrent transactions whose combined result would violate the
   overlap checks and rolls one back.

Serialization failures can appear as Postgres `40001` or Prisma `P2034`. The helper retries them up
to three times. This behaviour was verified with a deterministic concurrency test.

A caregiver also cannot accept a booking for a child they guard, regardless of which parent created
it. This is checked both when listing available bookings and again atomically inside the accepting
statement above, so a guardian who becomes a caregiver after the list was loaded still can't slip
through.

Before acceptance, caregivers see only the child's first name and each location's name and city in
the UI. The booking record itself, including any parent notes, is still fetched from the database at
this stage — nothing reads or displays those fields yet, but the query does not restrict them
either, so that protection lives in the UI today, not the data layer.

## Consequences

Serializable transactions cost more and may retry under contention, but this is acceptable at the
current scale.

The overlap condition exists twice in raw SQL because Prisma cannot express the required interval
calculation. If more checks need the same logic, it should be extracted.

The retry helper is safe because acceptance has no side effects outside the database. Future
operations such as notifications or payments will need separate handling to avoid running side
effects more than once.

`DECLINED` remains unused. Withdrawing after acceptance is also not implemented because it requires
notifying the parent.

## Open questions

Should the same concurrency guarantees apply when a trip starts? That state transition will
introduce its own races.
