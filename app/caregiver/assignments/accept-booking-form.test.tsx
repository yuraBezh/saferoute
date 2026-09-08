import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { assignmentsText } from '@/lib/content/assignments-text';

const mocks = vi.hoisted(() => ({ acceptBookingAction: vi.fn() }));

vi.mock('./actions', () => ({ acceptBookingAction: mocks.acceptBookingAction }));

import { AcceptBookingForm } from './accept-booking-form';

const booking = { id: 'booking-1' };
const { acceptLabel, caregiverConflictError, scheduleConflict, error: errorText } = assignmentsText;

describe('AcceptBookingForm', () => {
	beforeEach(() => vi.clearAllMocks());

	it('shows a caregiver conflict inline and disables the form', async () => {
		mocks.acceptBookingAction.mockResolvedValue({ error: caregiverConflictError });
		render(<AcceptBookingForm bookingId={booking.id} />);

		fireEvent.click(screen.getByRole('button', { name: acceptLabel }));

		expect((await screen.findByRole('alert')).textContent).toBe(caregiverConflictError);
		await waitFor(() => {
			expect(screen.getByRole('button', { name: acceptLabel })).toHaveProperty('disabled', true);
		});
		expect(screen.queryByText(errorText.description)).toBeNull();
	});

	it('disables acceptance when the booking already conflicts with the schedule', () => {
		render(<AcceptBookingForm bookingId={booking.id} hasCaregiverConflict />);

		expect(screen.getByRole('alert').textContent).toBe(scheduleConflict);
		expect(screen.getByRole('button', { name: acceptLabel })).toHaveProperty('disabled', true);
		expect(mocks.acceptBookingAction).not.toHaveBeenCalled();
	});
});
