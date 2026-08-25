# 0007. One table for all location types

Date: 2026-08-25
Status: accepted

## Context

SafeRoute uses three location types: Home, School, and Activity venue.

Bookings reference these locations in the same way, and all 3 types currently have the same fields: name, address, coordinates, and timezone.

The main difference is ownership:

* A Home is private and belongs to one parent.
* A School or Activity venue can be shared by multiple families.

## Decision

Use a single `Location` table with a `LocationType` enum.

A nullable `ownerUserId` controls ownership:

* If `ownerUserId` is set, the location is private.
* If it is null, the location is shared.

Separate tables are unnecessary because the location types currently have no type-specific fields. 
They would add extra joins or make booking relationships more complicated.

## Consequences

If one location type later needs its own fields, those fields will be nullable for the other types. 
For example, Schools may need opening hours or pickup zones, while Homes would leave those fields empty.

Some rules cannot be enforced by the DB alone. 
For example, a `HOME` location must always have an `ownerUserId`, so the application must enforce this.

Adding a new location type requires a migration because `LocationType` is an enum.

If many type-specific fields are added later, this design should be reconsidered.

## Open questions

Shared locations currently have no owner, so there is no clear way to correct incorrect data. 
An admin role or a `createdByUserId` field could solve this.

The `isVerified` field exists, but its purpose and ownership are not yet defined.
