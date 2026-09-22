# 0004. Delete policies per relation

**Date:** 2026-08-17
**Status:** Accepted

## Context

Every relation needs a delete policy.

Using `Cascade` everywhere is convenient because related rows are removed automatically. 
But in SafeRoute, some data represents history and must survive deletion of the records it refers to.

For example, deleting a child also deletes its `ChildGuardian` rows. 
This is acceptable because those links have no meaning without the child.

The same must not happen to trip history. 
Deleting a child, a caregiver, or an event's actor must not erase what happened during previous trips.

## Decision

Delete policies are chosen per relation.

| Relation                    | Policy     | Reason                                                       |
| ---------------------------- | ---------- | ------------------------------------------------------------- |
| `ChildGuardian -> Child`     | `Cascade`  | The link has no meaning without the child                     |
| `ChildGuardian -> User`      | `Restrict` | A guardian cannot be deleted while linked to a child           |
| `Trip -> Child`              | `Restrict` | Trip history must be saved                                    |
| `Trip -> User` (caregiver)   | `Restrict` | We must keep a record of who the caregiver was                |
| `TripEvent -> Trip`          | `Restrict` | Event history is part of the trip record                      |
| `TripEvent -> User` (actor)  | `SetNull`  | An event survives the actor being removed; who did it can go blank |

There is no separate audit-log table. `TripEvent` is the only history table SafeRoute has, and unlike a generic audit 
log it uses real foreign keys — trip history is guaranteed to point at a real `Trip`, at the cost of not being able 
to outlive it.

## Consequences

Hard-deleting a child with trip history throws a database constraint error, because `Trip -> Child` is `Restrict`. 
The application itself never attempts this — children are archived instead (below) — so this constraint is a backstop 
against direct SQL or a future write path, not something normal use hits.

Children are soft-deleted. `Child.deletedAt` marks a child as archived; archiving sets this field instead of removing 
the row, so it never touches `Trip -> Child` at all. A shared `ownedChildWhere` helper (`lib/data/children.ts`) applies 
the `deletedAt: null` filter everywhere a guardian's own children are read or booked, so a forgotten filter can't leak 
an archived child back into view.

Archiving does not cascade to `ChildGuardian`. The old hard-delete path removed a child's `ChildGuardian` rows via 
`Cascade`; archiving only sets `deletedAt` on `Child`, so guardian links stay intact. `ChildGuardian -> Child: Cascade` 
now only fires if a child row is ever hard-deleted directly — currently that only happens in `prisma/seed.ts`'s 
test-data reset, not through normal application use.

`TripEvent.actorUserId` is `SetNull`, so an event can survive its actor being removed — but `TripEvent.tripId` is 
`Restrict`, so event history cannot outlive its trip. There is no path today for an event to reference a trip that 
no longer exists.

Archiving a child is not itself recorded anywhere. There's no audit trail for who archived a child or when, beyond 
the `deletedAt` timestamp on the row itself. If that's needed later, it still has to be designed and added.
