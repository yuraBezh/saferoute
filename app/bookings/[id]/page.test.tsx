import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BookingStatus } from '@/generated/prisma/enums';
import { bookingsText } from '@/lib/content/bookings-text';

const mocks = vi.hoisted(() => ({
	getBooking: vi.fn(),
	notFound: vi.fn(() => {
		throw new Error('NEXT_NOT_FOUND');
	}),
	deleteButton: vi.fn(() => null),
}));
vi.mock('@/lib/data/bookings', () => ({ getBookingForCurrentUser: mocks.getBooking }));
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }));
vi.mock('@/components/ui/delete-button', () => ({ DeleteButton: mocks.deleteButton }));

import BookingDetailsPage from './page';

const bookingFixture = {
	id: 'booking-1',
	status: BookingStatus.PENDING,
	child: { id: 'child-1', firstName: 'John', lastName: 'Krasinski' },
	caregiver: null,
	scheduledPickupAt: new Date('2026-09-05T20:30:00Z'),
	estimatedDurationMin: 45,
	notes: null,
	pickupLocation: { id: 'pickup-1', name: 'School', timezone: 'America/Chicago' },
	activityLocation: null,
	dropoffLocation: { id: 'dropoff-1', name: 'Home' },
};

const renderPage = (id: string) =>
	BookingDetailsPage({ params: Promise.resolve({ id }), searchParams: Promise.resolve({}) });

describe('BookingDetailsPage', () => {
	beforeEach(() => vi.clearAllMocks());

	it('uses notFound for an inaccessible booking', async () => {
		mocks.getBooking.mockResolvedValue(null);
		await expect(renderPage('missing-booking')).rejects.toThrow();
		expect(mocks.notFound).toHaveBeenCalledOnce();
	});

	it('shows booking details and offers cancellation while pending', async () => {
		mocks.getBooking.mockResolvedValue(bookingFixture);
		render(await renderPage(bookingFixture.id));

		expect(
			screen.getByText(`${bookingFixture.child.firstName} ${bookingFixture.child.lastName}`),
		).toBeDefined();
		expect(screen.getByText(bookingsText.details.unassigned)).toBeDefined();
		expect(mocks.deleteButton).toHaveBeenCalledOnce();
	});

	it('hides cancellation after the booking leaves pending', async () => {
		mocks.getBooking.mockResolvedValue({ ...bookingFixture, status: BookingStatus.ACCEPTED });
		await renderPage(bookingFixture.id);
		expect(mocks.deleteButton).not.toHaveBeenCalled();
	});
});
