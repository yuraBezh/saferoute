import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

const mocks = vi.hoisted(() => ({
	getChildren: vi.fn(),
	getLocations: vi.fn(),
	bookingForm: vi.fn((props: unknown) => {
		void props;
		return null;
	}),
}));
vi.mock('@/lib/data/bookings', () => ({ getBookableChildrenForCurrentUser: mocks.getChildren }));
vi.mock('@/lib/data/locations', () => ({ getLocationsForCurrentUser: mocks.getLocations }));
vi.mock('@/components/booking-form', () => ({ BookingForm: mocks.bookingForm }));

import NewBookingPage from './page';

const childFixture = { id: 'child-1', firstName: 'John', lastName: 'Krasinski' };
const locationFixture = { id: 'location-1', name: 'School', timezone: 'America/Chicago' };

describe('NewBookingPage', () => {
	beforeEach(() => vi.clearAllMocks());

	it('loads bookable children and locations for the form', async () => {
		mocks.getChildren.mockResolvedValue([childFixture]);
		mocks.getLocations.mockResolvedValue([locationFixture]);

		render(await NewBookingPage());

		expect(mocks.getChildren).toHaveBeenCalledOnce();
		expect(mocks.getLocations).toHaveBeenCalledOnce();
		expect(mocks.bookingForm.mock.calls[0][0]).toMatchObject({
			childOptions: [childFixture],
			locations: [{ id: locationFixture.id, name: locationFixture.name }],
		});
	});
});
