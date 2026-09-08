CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Booking"
ADD CONSTRAINT "Booking_no_overlapping_child"
EXCLUDE USING gist (
    "childId" WITH =,
	tsrange(
		"scheduledPickupAt" AT TIME ZONE 'UTC',
		("scheduledPickupAt" AT TIME ZONE 'UTC') + make_interval(mins => "estimatedDurationMin"),
        '[)'
    ) WITH &&
)
WHERE ("status" = 'ACCEPTED');

ALTER TABLE "Booking"
ADD CONSTRAINT "Booking_no_overlapping_caregiver"
EXCLUDE USING gist (
    "caregiverUserId" WITH =,
	tsrange(
		"scheduledPickupAt" AT TIME ZONE 'UTC',
		("scheduledPickupAt" AT TIME ZONE 'UTC') + make_interval(mins => "estimatedDurationMin"),
        '[)'
    ) WITH &&
)
WHERE ("status" = 'ACCEPTED');
