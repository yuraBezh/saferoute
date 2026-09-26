# 0014. Trip state transitions and handoff

Date: 2026-09-22

Status: accepted

## Context

A trip moves through fixed states, from scheduled to completed. Each transition records where the
child is, so two rules must hold:

- Only valid domain transitions are allowed. A trip may be cancelled before pickup, but not after
  the child is in the car.
- Concurrent requests must not advance the same trip from the same state twice.

Handoff is the most important transition: it records when responsibility for the child moves from
one adult to another.

## Decision

Transitions are guarded by the state machine and optimistic locking. Events also carry idempotency
keys, with the limitations described below.

The state machine is a pure module with no database access. It defines valid transitions and the
actors allowed to perform them. It answers:

- whether a transition is allowed;
- which transitions are available from the current state.

The interface and server use the same source for ordinary transitions. Unit tests cover the state
machine, including the rule that cancellation is impossible after pickup.

Optimistic locking uses a version column. The server reads the current status and version, then
includes both in the update’s `where` clause. If no rows are updated, another request changed the
trip between the read and write. This is the same pattern used for booking acceptance.

Each event has a unique idempotency key. The client creates it once per form instance, so retries
from that form reuse it. For ordinary transitions, a duplicate that reaches event creation violates
the `TripEvent` unique index, rolls back the transaction, and returns success. Pickup handoff does
not catch this unique-key violation and returns an error instead.

The interface handles pickup handoff through a separate operation. It requires the parent’s
six-digit code and writes a distinct event type. The event log therefore distinguishes a normal
status change from pickup confirmed with the code. The underlying state machine still includes
`EN_ROUTE_TO_SCHOOL → CHILD_PICKED_UP` as an allowed caregiver transition.

The code is stored as plain text and compared with ordinary string equality. Hashing six digits
would add little protection because the entire million-value space can be searched quickly.

## Consequences

Every successful transition writes an event. Application code only inserts events; the database does
not independently enforce an append-only policy.

Each event has two timestamps:

- `occurredAt`, supplied by the data operation;
- when the server received it.

Current interface actions do not send the caregiver device time, so `occurredAt` is generated on the
server. In normal UI flows, both timestamps therefore represent server time and are usually close
together.

Idempotency is incomplete for sequential retries. After the first request changes the trip, a later
retry may fail while checking the new status before it reaches the duplicate event insert. Duplicate
keys prevent a second committed update, but callers are not always given success for an operation
that already ran.

Code attempts are unlimited. Brute force remains possible; an attempt counter and lockout are still
needed.

The version increases on every transition but is not sent to clients. It protects the gap between
the server’s read and write, not the gap between page rendering and submission. A stale action can
still succeed if its requested destination is valid from the latest database state. Detecting that
case requires sending the observed status or version with the action. Live updates would
additionally require pushing state changes and are out of scope.

## Open questions

- May a caregiver withdraw after accepting? What happens to a trip already in progress? Both cases
  require notifying the parent.
