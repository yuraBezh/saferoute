# 0002. `ChildGuardian` join table instead of a `parentId` field

Date: 2026-08-10
Status: accepted

## Context

A child in SafeRoute can have more than one responsible adult, and each adult can have different permissions.

For example:

1. Divorced parents. The mother books and pays for the trip, but the father
   still needs to see the child’s route in real time.
2. A grandmother who meets the child at home. She can confirm that the child arrived
   safely, but she does not book or pay for trips.
3. A court order. A parent stays a parent, but loses the right to arrange
   where the child goes.

These cases show two separate questions:

1. What is this adult’s relationship to the child?
2. What is this adult allowed to do?

A single `parentId` field on `Child` cannot represent this properly. It only allows one adult and does not support different permissions.

## Decision

We will add a `ChildGuardian` model between `Child` and `User`.
Each `ChildGuardian` record represents one adult’s relationship with one child.

It stores:

- the relationship type, such as mother, father, or other;
- whether the adult is the primary guardian;
- whether the adult can book trips;
- whether the adult can approve a handoff.

The combination of `childId` and `userId` must be unique,
so the same adult cannot be linked to the same child more than once.

We use an explicit `ChildGuardian` model instead of a simple many-to-many
relation because the relationship itself contains important information.

A simple many-to-many relation would only tell us:
`This user is connected to this child.`
But we also need to know:
`How are they related, and what are they allowed to do?`

Relationship type and permissions are stored separately on purpose.
For example, a grandmother may have the relationship type `OTHER` but still be allowed to approve a handoff.
A father may have the relationship type `FATHER` but not be allowed to book trips.
If relationship and permissions were stored as one value, these cases would be difficult or impossible to represent.

## Consequences

Fetching a child together with their guardians is slightly more expensive.
Prisma will usually fetch the children, then the `ChildGuardian` records, then the related users, and combine the results in memory.
This means roughly three queries instead of one. However, the number of queries does not increase for every child, so this is acceptable.
All child-related permission checks will now use the `ChildGuardian` table.

For example:

- Can this user see the child?
- Can this user book a trip for the child?
- Can this user confirm a handoff?

Having these rules in one place makes authorization easier to understand and maintain. However, it also means that mistakes in this model or its permission checks can affect access across the application.
The database can still contain a child with no guardians.
The schema itself does not prevent this, so the application must make sure that every child has at least one guardian.
Relationship types are stored as an `enum`.
This prevents invalid values from being saved in the database.
The downside is that adding a new relationship type requires a database migration.
