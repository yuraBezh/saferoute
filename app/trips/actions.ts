'use server';

import { revalidatePath } from 'next/cache';
import { TripStatus } from '@/generated/prisma/enums';
import type { TripActor } from '@/lib/trips/state-machine';
import { confirmPickupWithPin, transitionTrip } from '@/lib/data/trips';
import { tripText } from '@/lib/content/trip-text';
import { TRIP_ERRORS } from '@/lib/trips/errors';
import { pinSchema } from '@/lib/validation/trip';

const { notFound, invalidTransition, versionConflict, invalidPin } = TRIP_ERRORS;
const {
	notFoundError,
	invalidTransitionError,
	versionConflictError,
	invalidPinError,
	missingKeyError,
	saveError,
} = tripText;

export type TripActionState = {
	message: string;
	errors?: { pin?: string[] };
};

const getTripErrorMessage = (error: unknown): string => {
	if (error instanceof Error) {
		switch (error.message) {
			case notFound:
				return notFoundError;
			case invalidTransition:
				return invalidTransitionError;
			case versionConflict:
				return versionConflictError;
			case invalidPin:
				return invalidPinError;
		}
	}

	console.error('Trip action failed', error);
	return saveError;
};

export async function transitionTripAction(
	tripId: string,
	to: TripStatus,
	actor: TripActor,
	_prevState: TripActionState,
	formData: FormData,
): Promise<TripActionState> {
	const idempotencyKey = formData.get('idempotencyKey');

	if (typeof idempotencyKey !== 'string' || !idempotencyKey) {
		return { message: missingKeyError };
	}

	try {
		await transitionTrip({ tripId, to, actor, idempotencyKey });
	} catch (error) {
		return { message: getTripErrorMessage(error) };
	}

	revalidatePath(`/trips/${tripId}`);
	return { message: '' };
}

export async function confirmPickupAction(
	tripId: string,
	_prevState: TripActionState,
	formData: FormData,
): Promise<TripActionState> {
	const idempotencyKey = formData.get('idempotencyKey');

	if (typeof idempotencyKey !== 'string' || !idempotencyKey) {
		return { message: missingKeyError };
	}

	const pin = formData.get('pin');
	const parsed = pinSchema.safeParse(pin);

	if (!parsed.success) {
		return {
			message: invalidPinError,
			errors: { pin: [invalidPinError] },
		};
	}

	try {
		await confirmPickupWithPin({ tripId, pin: parsed.data, idempotencyKey });
	} catch (error) {
		if (error instanceof Error && error.message === invalidPin) {
			return { message: invalidPinError, errors: { pin: [invalidPinError] } };
		}
		return { message: getTripErrorMessage(error) };
	}

	revalidatePath(`/trips/${tripId}`);
	return { message: '' };
}
