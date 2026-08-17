# 0004. Delete policies per relation

**Date:** 2026-08-17
**Status:** Accepted

## Context

Every relation needs a delete policy.

Using `Cascade` everywhere is convenient because related rows are removed automatically. But in SafeRoute, some data represents history and must survive deletion of the records it refers to.

For example, deleting a child also deletes its `ChildGuardian` rows. This is acceptable because those links have no meaning without the child.

The same must not happen to `trips`, `handoffs`, or `audit` records. Deleting a child must not erase the history of what happened during previous trips.

## Decision

Delete policies are chosen per relation.

| Relation                   | Policy         | Reason                                                |
| -------------------------- | -------------- |-------------------------------------------------------|
| `ChildGuardian -> Child`   | `Cascade`      | The link has no meaning without the child             |
| `ChildGuardian -> User`    | `Restrict`     | A guardian cannot be deleted while linked to a child  |
| `Trip -> Child`            | `Restrict`     | Trip history must be saved                            |
| `Trip -> User (caregiver)` | `Restrict`     | We must keep a record of who the caregiver was        |
| `TripHandoff -> Trip`      | `Restrict`     | Handoff records are part of the history               |
| `AuditLog -> anything`     | No foreign key | Audit records must survive deletion of other entities |

`AuditLog` stores `entityType` and `entityId` as plain values instead of foreign keys. This allows the log to reference entities that no longer exist.

## Consequences

A child with existing trips cannot be hard-deleted because `Trip -> Child` uses `Restrict`.

Before `trips` are introduced, children will need soft delete, for example with a `deletedAt` field.

Soft-deleted records must be excluded from normal queries. This filtering should be handled in one place to avoid missing it in individual queries.

`Audit` logs may reference records that have already been deleted. This is expected and is not a data error.

Deleting a child still removes its `ChildGuardian` links. Once audit logging is added, the deletion itself will remain recorded in the audit history.
