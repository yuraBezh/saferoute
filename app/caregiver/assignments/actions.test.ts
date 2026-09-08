import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CAREGIVER_ERRORS } from '@/lib/caregiver/errors';
import { assignmentsText } from '@/lib/content/assignments-text';

const mocks = vi.hoisted(() => ({
	acceptBooking: vi.fn(),
	revalidatePath: vi.fn(),
	redirect: vi.fn(),
}));

vi.mock('@/lib/data/caregiver-bookings', () => ({
	acceptBookingForCurrentCaregiver: mocks.acceptBooking,
}));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

import { acceptBookingAction, type AcceptBookingState } from './actions';

const booking = { id: 'booking-1' };
const initialState: AcceptBookingState = { error: null };

describe('acceptBookingAction', () => {
	beforeEach(() => vi.clearAllMocks());

	it('returns a caregiver conflict as form state', async () => {
		mocks.acceptBooking.mockRejectedValue(new Error(CAREGIVER_ERRORS.caregiverConflict));

		await expect(acceptBookingAction(booking.id, initialState, new FormData())).resolves.toEqual({
			error: assignmentsText.caregiverConflictError,
		});
		expect(mocks.revalidatePath).not.toHaveBeenCalled();
		expect(mocks.redirect).not.toHaveBeenCalled();
	});
});
