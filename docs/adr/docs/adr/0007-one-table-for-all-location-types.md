# 0007. One table for all location types

Date: 2026-08-25
Status: accepted

## Context

SafeRoute uses three location types: Home, School, and Activity venue.

Bookings reference these locations in the same way, and all 3 types currently have the same fields:
name, address, coordinates, and timezone.

The main difference is ownership:

* A Home is private and belongs to one parent.
* A School or Activity venue can be shared by multiple families.

## Decision

Use a single `Location` table with a `LocationType` enum.

A nullable `ownerUserId` controls ownership: set means private, null means shared.

Separate tables are unnecessary because the location types currently have no type-specific fields.
They would add extra joins or make booking relationships more complicated.

Reading already supports shared locations — a guardian sees their own locations plus every shared
one. Creating one does not: every location made through the app today gets an owner, regardless of
type, so a School or Activity venue can't actually be created as shared yet. The only shared
locations that exist were seeded directly into the database. Letting guardians create a location as
shared is planned future work.

## Consequences

If one location type later needs its own fields, those fields will be nullable for the other types.
For example, Schools may need opening hours or pickup zones, while Homes would leave those fields
empty.

Some rules cannot be enforced by the DB alone. Right now every location gets an owner when created,
regardless of type — there's no branching by type yet, because shared creation doesn't exist. Once
it does, the application will need to enforce a stricter rule: a Home always keeps its owner, while
a School or Activity venue is allowed to drop it.

Adding a new location type requires a migration because `LocationType` is an enum.

If many type-specific fields are added later, this design should be reconsidered.

## Open questions

Shared locations currently have no owner, so there is no clear way to correct incorrect data. An
admin role or a creator field could solve this.

The `isVerified` field now has a defined display purpose — a shared location can show as "Verified"
— but nothing sets it yet outside test data. Who verifies a shared location, and how, is still
undecided, and will need answering alongside the shared-location creation path above.
