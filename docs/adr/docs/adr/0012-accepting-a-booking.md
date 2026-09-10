# 0012. Accepting a booking

Date: 2026-09-10
Status: accepted

## Context

A pending booking is visible to every verified caregiver in the city. Accepting it commits one caregiver to one child at one time.

Acceptance must prevent three races:

* Two caregivers accepting the same booking.
* A child having overlapping accepted bookings.
* A caregiver accepting overlapping bookings.

ADR 0011 identified the first two as future requirements because acceptance had not yet been implemented.

## Decision

Acceptance runs in a Serializable transaction with automatic retries.

Three independent protections enforce the rules:

1. All reads and conflict checks use the transaction client, keeping them in the same Postgres snapshot and conflict tracking.
2. The booking is updated with `updateMany`, requiring it to still be `PENDING` and unassigned. 
   If zero rows are updated, acceptance fails.
3. Serializable isolation detects concurrent transactions whose combined result would violate the overlap checks and rolls one back.

Serialization failures can appear as Postgres `40001` or Prisma `P2034`. The helper retries them up to three times. 
This behaviour was verified with a deterministic concurrency test.

A caregiver also cannot accept a booking for a child they guard, regardless of which parent created it.

Before acceptance, caregivers see only the child's first name and each location's name and city. 
Full addresses, surname, and parent notes become visible only after acceptance because pending bookings are visible 
to all verified caregivers and notes may contain sensitive information.

## Consequences

Serializable transactions cost more and may retry under contention, but this is acceptable at the current scale.

The overlap condition exists twice in raw SQL because Prisma cannot express the required interval calculation. 
If more checks need the same logic, it should be extracted.

The retry helper is safe because acceptance has no side effects outside the database. 
Future operations such as notifications or payments will need separate handling to avoid running side effects more than once.

`DECLINED` remains unused. Withdrawing after acceptance is also not implemented because it requires notifying the parent.

## Open questions

Should the same concurrency guarantees apply when a trip starts? That state transition will introduce its own races.
