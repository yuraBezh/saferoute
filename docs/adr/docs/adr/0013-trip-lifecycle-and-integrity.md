# 0013. Trip lifecycle and integrity

Date: 2026-09-15
Status: accepted

## Context

A `Trip` records the execution of an accepted booking. It has its own lifecycle and event history.

Only one in-progress trip may exist for a child at a time. An application check alone is
insufficient because two concurrent requests could both observe that no active trip exists and then
create or activate separate trips.

The rule must therefore be enforced by PostgreSQL. Enforcing it efficiently requires `childId` to be
stored directly on `Trip`; PostgreSQL cannot build the required partial unique index through the
related `Booking` row.

## Decision

Store `childId` directly on `Trip` and relate it to `Child` with `onDelete: Restrict`.

The purpose of this column is to support the database constraint that allows at most one in-progress
trip per child. It is not a general snapshot of booking data. When a trip is created, the
application must copy `Booking.childId` into `Trip.childId` in the same transaction.

The in-progress statuses are:

- `EN_ROUTE_TO_SCHOOL`
- `CHILD_PICKED_UP`
- `AT_ACTIVITY`
- `EN_ROUTE_HOME`

`SCHEDULED` means that a trip has been assigned but has not started, so it does not prevent another
assigned trip on a different day. `COMPLETED` and `CANCELLED` are terminal and do not prevent
another trip for the same child.

A manual SQL migration creates a partial unique index named `one_in_progress_trip_per_child` on
`Trip.childId` for the in-progress statuses. Prisma does not represent partial indexes in
`schema.prisma`, so the schema documents that the constraint is maintained by SQL.

## Consequences

Booking exclusion constraints reject overlapping scheduled bookings for the same child or caregiver.
The Trip partial unique index rejects concurrent writes that would put the same child in two
in-progress trips, regardless of which application code path performs the write. These are separate
invariants with separate database mechanisms.

`Trip.childId` and `Booking.childId` can technically diverge because a foreign key cannot enforce
equality across the two relations. Trip creation must set both `bookingId` and `childId` from the
same booking inside one transaction.

Changing which statuses count as in-progress requires a migration that replaces the partial unique
index.
