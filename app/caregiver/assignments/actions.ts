'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { CAREGIVER_ERRORS } from '@/lib/caregiver/errors';
import { assignmentsText } from '@/lib/content/assignments-text';
import { acceptBookingForCurrentCaregiver } from '@/lib/data/caregiver-bookings';

const { notVerified, notAvailable, childConflict, caregiverConflict } = CAREGIVER_ERRORS;
const {
	notVerifiedError,
	notAvailableError,
	childConflictError,
	caregiverConflictError,
	saveError,
} = assignmentsText;

export type AcceptBookingState = { error: string | null };

type AcceptBookingAction = (
	bookingId: string,
	previousState: AcceptBookingState,
	formData: FormData,
) => Promise<AcceptBookingState>;

const getExpectedAcceptErrorMessage = (error: unknown): string | null => {
	if (error instanceof Error) {
		switch (error.message) {
			case notVerified:
				return notVerifiedError;
			case notAvailable:
				return notAvailableError;
			case childConflict:
				return childConflictError;
			case caregiverConflict:
				return caregiverConflictError;
		}
	}

	return null;
};

export const acceptBookingAction: AcceptBookingAction = async (bookingId) => {
	try {
		await acceptBookingForCurrentCaregiver(bookingId);
	} catch (error) {
		const message = getExpectedAcceptErrorMessage(error);
		if (message) return { error: message };

		console.error('Failed to accept booking', error);
		throw new Error(saveError, { cause: error });
	}

	revalidatePath('/caregiver/assignments');
	redirect('/caregiver/assignments');
};
