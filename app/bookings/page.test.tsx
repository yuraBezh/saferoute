import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BookingStatus } from '@/generated/prisma/enums';
import { bookingsText } from '@/lib/content/bookings-text';

const mocks = vi.hoisted(() => ({ getBookings: vi.fn() }));
vi.mock('@/lib/data/bookings', () => ({ getBookingsForCurrentUser: mocks.getBookings }));

import BookingsPage from './page';

const bookingFixture = {
	id: 'booking-1',
	child: { id: 'child-1', firstName: 'John', lastName: 'Krasinski' },
	caregiver: null,
	status: BookingStatus.PENDING,
	expiresAt: new Date('2099-09-05T18:30:00Z'),
	scheduledPickupAt: new Date('2026-09-05T20:30:00Z'),
	estimatedDurationMin: 45,
	pickupLocation: { id: 'pickup-1', name: 'School', timezone: 'America/Chicago' },
	activityLocation: null,
	dropoffLocation: { id: 'dropoff-1', name: 'Home' },
};

describe('BookingsPage', () => {
	beforeEach(() => vi.clearAllMocks());

	it('shows direction when there are no bookings', async () => {
		mocks.getBookings.mockResolvedValue([]);
		render(await BookingsPage());

		expect(screen.getByText(bookingsText.empty.title)).toBeDefined();
		expect(screen.getByRole('link', { name: bookingsText.empty.cta })).toBeDefined();
	});

	it('shows each booking with its child, route, and status', async () => {
		mocks.getBookings.mockResolvedValue([bookingFixture]);
		render(await BookingsPage());

		expect(
			screen.getByText(`${bookingFixture.child.firstName} ${bookingFixture.child.lastName}`),
		).toBeDefined();
		expect(
			screen.getByText(
				`${bookingFixture.pickupLocation.name} → ${bookingFixture.dropoffLocation.name}`,
			),
		).toBeDefined();
		expect(screen.getByText(bookingsText.status[bookingFixture.status])).toBeDefined();
	});

	it('displays an expired pending booking without changing its stored status', async () => {
		mocks.getBookings.mockResolvedValue([
			{ ...bookingFixture, expiresAt: new Date('2000-01-01T00:00:00Z') },
		]);
		render(await BookingsPage());

		expect(screen.getByText(bookingsText.status[BookingStatus.EXPIRED])).toBeDefined();
	});
});
