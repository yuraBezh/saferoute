import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TripStatus } from '@/generated/prisma/enums';
import { tripText } from '@/lib/content/trip-text';

const mocks = vi.hoisted(() => ({ getTripForCaregiver: vi.fn(), notFound: vi.fn() }));

vi.mock('@/lib/data/trips', () => ({ getTripForCaregiver: mocks.getTripForCaregiver }));
vi.mock('next/navigation', () => ({
	notFound: mocks.notFound.mockImplementation(() => {
		throw new Error('not found');
	}),
}));
vi.mock('@/components/booking-route', () => ({
	BookingRoute: ({
		pickup,
		activity,
		dropoff,
	}: {
		pickup: string;
		activity?: string;
		dropoff: string;
	}) => <div>{[pickup, activity, dropoff].filter(Boolean).join(' → ')}</div>,
}));
vi.mock('../trip-transition-form', () => ({
	TripTransitionForm: ({ label }: { label: string }) => <button>{label}</button>,
}));
vi.mock('../trip-pickup-form', () => ({
	PickupForm: ({ cancelAction }: { cancelAction?: React.ReactNode }) => (
		<div data-testid="pickup-form">{cancelAction}</div>
	),
}));

import TripPage from './page';

const tripId = 'trip-1';
const trip = (status: TripStatus, activityLocationId: string | null = null) => ({
	id: tripId,
	status,
	child: { id: 'child-1', firstName: 'Maya', lastName: 'Rivera' },
	caregiver: { id: 'caregiver-1', fullName: 'Care Giver', avatarUrl: null },
	booking: {
		scheduledPickupAt: new Date('2026-09-17T20:00:00Z'),
		notes: null,
		activityLocationId,
		pickupLocation: { name: 'School' },
		activityLocation: activityLocationId ? { name: 'Ballet' } : null,
		dropoffLocation: { name: 'Home' },
	},
});

const renderPage = async () =>
	render(
		await TripPage({
			params: Promise.resolve({ id: tripId }),
			searchParams: Promise.resolve({}),
		}),
	);

describe('TripPage', () => {
	beforeEach(() => vi.clearAllMocks());

	it('shows pickup confirmation with cancellation while traveling to school', async () => {
		mocks.getTripForCaregiver.mockResolvedValue(trip(TripStatus.EN_ROUTE_TO_SCHOOL));

		await renderPage();

		expect(screen.getByTestId('pickup-form')).toBeDefined();
		expect(screen.getByRole('button', { name: tripText.actionLabels.CANCELLED })).toBeDefined();
		expect(screen.queryByRole('button', { name: tripText.actionLabels.AT_ACTIVITY })).toBeNull();
	});

	it('offers only the route home after pickup when no activity is booked', async () => {
		mocks.getTripForCaregiver.mockResolvedValue(trip(TripStatus.CHILD_PICKED_UP));

		await renderPage();

		expect(screen.getByRole('button', { name: tripText.actionLabels.EN_ROUTE_HOME })).toBeDefined();
		expect(screen.queryByRole('button', { name: tripText.actionLabels.AT_ACTIVITY })).toBeNull();
		expect(screen.queryByTestId('pickup-form')).toBeNull();
	});

	it('offers the activity and route home after pickup when an activity is booked', async () => {
		mocks.getTripForCaregiver.mockResolvedValue(trip(TripStatus.CHILD_PICKED_UP, 'activity-1'));

		await renderPage();

		const actions = screen.getAllByRole('button');
		expect(actions[0].textContent).toBe(tripText.skipActivityAction);
		expect(actions[1].textContent).toBe(tripText.actionLabels.AT_ACTIVITY);
		expect(screen.getByText('School → Ballet → Home')).toBeDefined();
	});

	it('returns not found for a trip unavailable to the caregiver', async () => {
		mocks.getTripForCaregiver.mockResolvedValue(null);

		await expect(renderPage()).rejects.toThrow('not found');
		expect(mocks.notFound).toHaveBeenCalledOnce();
	});
});
