'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { bookingFormText } from '@/lib/content/booking-form-text';
import { BOOKING_DATA_ERRORS } from '@/lib/bookings/errors';
import {
	cancelBookingForCurrentUser,
	createBookingForCurrentUser,
	getAccessibleLocation,
} from '@/lib/data/bookings';
import { fromUtc } from '@/lib/date';
import { createBookingSchema } from '@/lib/validation/booking';

export type BookingFormState = {
	message: string;
	errors?: {
		childId?: string[];
		date?: string[];
		time?: string[];
		pickupLocationId?: string[];
		activityLocationId?: string[];
		dropoffLocationId?: string[];
		estimatedDurationMin?: string[];
		notes?: string[];
	};
};

const pickupLocationError = (error: string): BookingFormState => ({
	message: bookingFormText.validationError,
	errors: { pickupLocationId: [error] },
});

const createErrorState = (error: unknown): BookingFormState => {
	if (error instanceof Error) {
		switch (error.message) {
			case BOOKING_DATA_ERRORS.childNotBookable:
				return { message: bookingFormText.childNotBookableError };
			case BOOKING_DATA_ERRORS.pickupInPast:
				return { message: bookingFormText.pickupInPastError };
			case BOOKING_DATA_ERRORS.overlappingBooking:
				return { message: bookingFormText.overlappingBookingError };
		}
	}

	console.error('Failed to create booking', error);
	return { message: bookingFormText.saveError };
};

export async function createBookingAction(
	_prevState: BookingFormState,
	formData: FormData,
): Promise<BookingFormState> {
	const pickupLocationValue = formData.get('pickupLocationId');
	if (typeof pickupLocationValue !== 'string' || !pickupLocationValue.trim()) {
		return pickupLocationError(bookingFormText.fields.pickupLocationId.required);
	}

	const pickupLocationId = pickupLocationValue.trim();
	let pickupLocation: Awaited<ReturnType<typeof getAccessibleLocation>>;
	try {
		pickupLocation = await getAccessibleLocation(pickupLocationId);
	} catch (error) {
		return createErrorState(error);
	}

	if (!pickupLocation) {
		return pickupLocationError(bookingFormText.fields.pickupLocationId.invalid);
	}

	const todayAtPickupLocation = fromUtc(new Date(), pickupLocation.timezone).date;
	const parsed = createBookingSchema(todayAtPickupLocation).safeParse({
		childId: formData.get('childId'),
		date: formData.get('date'),
		time: formData.get('time'),
		pickupLocationId,
		activityLocationId: formData.get('activityLocationId'),
		dropoffLocationId: formData.get('dropoffLocationId'),
		estimatedDurationMin: formData.get('estimatedDurationMin'),
		notes: formData.get('notes'),
	});

	if (!parsed.success) {
		return {
			message: bookingFormText.validationError,
			errors: z.flattenError(parsed.error).fieldErrors,
		};
	}

	try {
		await createBookingForCurrentUser(parsed.data);
	} catch (error) {
		return createErrorState(error);
	}

	revalidatePath('/bookings');
	redirect('/bookings');
}

export async function cancelBookingAction(id: string): Promise<void> {
	try {
		await cancelBookingForCurrentUser(id);
	} catch (error) {
		console.error('Failed to cancel booking', error);
		revalidatePath(`/bookings/${id}`);
		redirect(`/bookings/${id}`);
	}

	revalidatePath('/bookings');
	redirect('/bookings');
}
