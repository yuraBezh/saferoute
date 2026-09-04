# 0011. Booking lifecycle, time, and integrity

**Date:** 2026-09-04
**Status:** Accepted

## Context

A `Booking` is a request for future care, not a `Trip`. It may be declined, expire, or later create one or more trips.

A booking belongs to one child and one parent, may have a caregiver, and can reference pickup, activity, and drop-off locations.

Pickup time is entered in the pickup location's timezone but stored as an exact UTC instant.

A child may have multiple overlapping `PENDING` bookings, but `ACCEPTED` bookings must not overlap.

Prisma cannot express the PostgreSQL exclusion constraint needed to enforce this rule directly in the schema.

## Decision

Use named Prisma relations for users and locations.

All `Booking` foreign keys use `onDelete: Restrict` so booking history keeps its related child, users, and route.

Store `scheduledPickupAt` and `expiresAt` as `timestamptz`. Convert input and output using the pickup location's timezone in `lib/date.ts` with `date-fns-tz`.

Form validation rejects calendar dates before the pickup location's current date, but it does not decide whether a time
earlier on that same date has already passed. After the data layer loads the pickup location and combines the submitted
date, time, and timezone into a UTC instant, it must reject `scheduledPickupAt <= now` before creating the booking.

A booking expires two hours before pickup:

`expiresAt = scheduledPickupAt - 2 hours`

Available bookings must have `expiresAt > now`.

For now, expired bookings may still be stored as `PENDING`; the UI derives `EXPIRED` from `expiresAt`.

Overlap is not enforced yet because acceptance is not implemented.

When a booking changes from `PENDING` to `ACCEPTED`, the overlap check and update must run in one Prisma `$transaction` with PostgreSQL `Serializable` isolation and limited retries.

Two bookings overlap if:

`start1 < end2 && start2 < end1`

where:

`end = scheduledPickupAt + estimatedDurationMin`

A creation-time overlap check may be added for UX, but it must not block overlapping `PENDING` bookings.

## Consequences

Referenced children, users, and locations cannot be deleted accidentally.

Serializable transactions protect concurrent acceptance, but PostgreSQL may abort one transaction when two conflicting bookings are accepted at the same time.

A future migration may replace this with a PostgreSQL exclusion constraint for a stronger database-level guarantee.

## Open questions

* When should a job persist `EXPIRED` and send notifications?
* When should overlap enforcement move to a PostgreSQL exclusion constraint?
* How should recurring bookings create bookings and trips without duplicating scheduling logic?
