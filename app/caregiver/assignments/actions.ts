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

const getAcceptErrorMessage = (error: unknown): string => {
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

	console.error('Failed to accept booking', error);
	return saveError;
};

export async function acceptBookingAction(bookingId: string): Promise<void> {
	try {
		await acceptBookingForCurrentCaregiver(bookingId);
	} catch (error) {
		throw new Error(getAcceptErrorMessage(error), { cause: error });
	}

	revalidatePath('/caregiver/assignments');
	redirect('/caregiver/assignments');
}
