# 0005. Calendar dates as strings (not timestamps)

**Date:** 2026-08-17
**Status:** Accepted

## Context

A date of birth is a calendar date. It has no time or timezone.

JavaScript `Date` represents a moment in time, so converting a calendar date to `Date` can shift it by one day depending on the timezone.

I hit this during development. For example:

```ts
new Date("2010-01-01")
```

is parsed as midnight UTC. In Houston, that is still the previous day locally, which caused `2009-12-31` to be stored.

Using local time instead is also unsafe because the result depends on where the code runs.

The same problem applies to `z.coerce.date()`, because it also converts the value to a JavaScript `Date`.

## Decision

Calendar dates are represented as `YYYY-MM-DD` strings throughout the application.

This includes:

* form values
* validation
* API data

Strings in this format can be compared directly because their order matches calendar order.

Conversion to `Date` happens only when passing the value to Prisma:

```ts
new Date(`${value}T00:00:00.000Z`)
```

When reading from Prisma, the value is converted back to a string:

```ts
date.toISOString().slice(0, 10)
```

Application code should work with `YYYY-MM-DD` strings, not `Date` objects, for calendar dates.

## Consequences

The conversion to and from Prisma should be kept in a shared helper so the same rule is not repeated across the application.

Calendar dates and timestamps are different concepts and must be handled differently.

For example, a date of birth is a calendar date, while a trip pickup time is a real moment in time and should be stored as a UTC timestamp.

Timezone handling for trip scheduling will be decided separately.
