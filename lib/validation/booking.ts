import * as z from 'zod';
import { bookingFormText } from '@/lib/content/booking-form-text';
import { shiftDateByDays } from '@/lib/date';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const { fields } = bookingFormText;

const optionalString = (maxLength: number, error: string) =>
	z
		.string()
		.trim()
		.max(maxLength, { error })
		.optional()
		.transform((value) => value || undefined);

const optionalId = z
	.string()
	.trim()
	.max(30, { error: fields.activityLocationId.invalid })
	.optional()
	.transform((value) => value || undefined);

const isCalendarDate = (value: string) => {
	if (!DATE_PATTERN.test(value)) return false;

	const date = new Date(`${value}T00:00:00.000Z`);

	return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const requiredId = (required: string, invalid: string) =>
	z.string({ error: required }).trim().min(1, { error: required }).max(30, { error: invalid });

export const createBookingSchema = (todayAtPickupLocation: string) => {
	const latestBookingDate = shiftDateByDays(todayAtPickupLocation, 30);

	return z.object({
		childId: requiredId(fields.childId.required, fields.childId.invalid),
		pickupLocationId: requiredId(fields.pickupLocationId.required, fields.pickupLocationId.invalid),
		activityLocationId: optionalId,
		dropoffLocationId: requiredId(
			fields.dropoffLocationId.required,
			fields.dropoffLocationId.invalid,
		),
		date: z
			.string({ error: fields.date.invalid })
			.refine(isCalendarDate, { error: fields.date.invalid, abort: true })
			.refine((date) => date >= todayAtPickupLocation, { error: fields.date.past })
			.refine((date) => date <= latestBookingDate, { error: fields.date.tooFar }),
		time: z.string({ error: fields.time.invalid }).regex(TIME_PATTERN, {
			error: fields.time.invalid,
		}),
		estimatedDurationMin: z.coerce
			.number({ error: fields.estimatedDurationMin.invalid })
			.int({ error: fields.estimatedDurationMin.invalid })
			.min(15, { error: fields.estimatedDurationMin.invalid })
			.max(480, { error: fields.estimatedDurationMin.invalid }),
		notes: optionalString(500, fields.notes.tooLong),
	});
};

type BookingSchema = ReturnType<typeof createBookingSchema>;

export type BookingFormInput = z.input<BookingSchema>;
export type BookingInput = z.output<BookingSchema>;
