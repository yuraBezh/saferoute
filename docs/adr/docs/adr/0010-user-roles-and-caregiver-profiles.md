# 0010. User roles and caregiver profiles

Date: 2026-09-02
Status: accepted

## Context

A SafeRoute user can have multiple roles. For example, a parent can also be a caregiver.

A single `role` field cannot support this. Separate flags such as `isParent` and `isCaregiver` also do not scale well 
because every new role requires schema and query changes.

Caregiver-specific data, such as bio, hourly rate, vehicle details, and verification status, should not be stored on 
`User` because it does not apply to most users.

Hourly rates must be stored exactly. `Float` can introduce rounding errors. Prisma `Decimal` is exact but adds extra complexity. 
Since SafeRoute does not need fractional cents or multiple currencies yet, storing rates as integer cents is simpler.

## Decision

Store user roles in a PostgreSQL `UserRole[]` enum array on `User`, with `PARENT` as the default.

Initial roles:

* `PARENT`
* `CAREGIVER`
* `ADMIN`

Roles are checked directly on the user without joins. 
If role history or audit metadata is needed later, roles can be moved to a separate join table.

Store caregiver-specific data in a one-to-one `CaregiverProfile`.

A new profile starts in `PENDING_VERIFICATION`. 
There is no `DRAFT` state because all required profile data must be provided when it is created.

Store verification documents under `CaregiverProfile`. 
Each document keeps its storage key, review status, reviewer, review date, and optional expiration date.

Store hourly rates as integer cents in `hourlyRateCents`.

Add an index on `CaregiverProfile.status` because caregiver search and moderation will often filter by verification status.

## Consequences

A user can be both a parent and a caregiver without creating multiple accounts.

Adding a new role still requires a PostgreSQL enum migration. 
Role assignment history is not available unless an audit log or join table is added later.

Caregiver data can evolve without adding nullable fields to `User`.

Deleting a user also deletes their caregiver profile and verification documents. 
Deleting a reviewer keeps the document but clears its reviewer reference.

Rates remain exact and are formatted from cents when displayed.

Supporting multiple currencies or fractional cents later will require a different money model.

The caregiver profile does not store a separate verification timestamp. 
If the system needs to know when a caregiver was verified, that date must be derived from approved verification documents.

## Open questions

What should happen when a verification document expires?

For example, should an expired driver's license or insurance move a `VERIFIED` caregiver back to `PENDING_VERIFICATION`, 
or should there be a separate status?

How should expiration be detected: by a scheduled job, during caregiver listing or booking, or both?
