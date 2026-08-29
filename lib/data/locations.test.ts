import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocationType } from '@/generated/prisma/enums';
import type { LocationInput } from '@/lib/validation/location';

const mocks = vi.hoisted(() => ({
	getCurrentUserId: vi.fn(),
	findManyLocations: vi.fn(),
	findFirstLocation: vi.fn(),
	createLocation: vi.fn(),
	updateLocations: vi.fn(),
	deleteLocations: vi.fn(),
}));

vi.mock('@/lib/auth/current-user', () => ({
	getCurrentUserId: mocks.getCurrentUserId,
}));

vi.mock('@/lib/prisma', () => ({
	prisma: {
		location: {
			findMany: mocks.findManyLocations,
			findFirst: mocks.findFirstLocation,
			create: mocks.createLocation,
			updateMany: mocks.updateLocations,
			deleteMany: mocks.deleteLocations,
		},
	},
}));

import {
	createLocationForCurrentUser,
	deleteLocationForCurrentUser,
	getLocationsForCurrentUser,
	getOwnedLocation,
	updateLocationForCurrentUser,
} from '@/lib/data/locations';

const currentUser = { id: 'user-1' };
const locationInput: LocationInput = {
	type: LocationType.SCHOOL,
	name: 'Lincoln Elementary',
	addressLine1: '123 Main St',
	addressLine2: undefined,
	city: 'Chicago',
	state: 'IL',
	postalCode: '60601',
};
const location = {
	id: 'location-1',
	...locationInput,
	ownerUserId: currentUser.id,
};

describe('locations data access', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getCurrentUserId.mockResolvedValue(currentUser.id);
	});

	it('lists current user and shared locations in display order', async () => {
		const locations = [location];
		mocks.findManyLocations.mockResolvedValue(locations);

		await expect(getLocationsForCurrentUser()).resolves.toBe(locations);
		expect(mocks.findManyLocations).toHaveBeenCalledWith({
			where: {
				OR: [{ ownerUserId: currentUser.id }, { ownerUserId: null }],
			},
			orderBy: [{ type: 'asc' }, { name: 'asc' }],
		});
	});

	it('loads a location only when the current user owns it', async () => {
		mocks.findFirstLocation.mockResolvedValue(location);

		await expect(getOwnedLocation(location.id)).resolves.toBe(location);
		expect(mocks.findFirstLocation).toHaveBeenCalledWith({
			where: { id: location.id, ownerUserId: currentUser.id },
		});
	});

	it('creates a location owned by the current user', async () => {
		mocks.createLocation.mockResolvedValue(location);

		await createLocationForCurrentUser(locationInput);

		expect(mocks.createLocation).toHaveBeenCalledWith({
			data: { ...locationInput, ownerUserId: currentUser.id },
		});
	});

	it('updates only a location owned by the current user', async () => {
		const updateResult = { count: 1 };
		mocks.updateLocations.mockResolvedValue(updateResult);

		await expect(
			updateLocationForCurrentUser(location.id, locationInput),
		).resolves.toBe(updateResult);
		expect(mocks.updateLocations).toHaveBeenCalledWith({
			where: { id: location.id, ownerUserId: currentUser.id },
			data: locationInput,
		});
	});

	it('deletes only a location owned by the current user', async () => {
		const deleteResult = { count: 1 };
		mocks.findFirstLocation.mockResolvedValue(location);
		mocks.deleteLocations.mockResolvedValue(deleteResult);

		await expect(deleteLocationForCurrentUser(location.id)).resolves.toBe(
			deleteResult,
		);
		expect(mocks.findFirstLocation).toHaveBeenCalledWith({
			where: { id: location.id, ownerUserId: currentUser.id },
		});
		expect(mocks.deleteLocations).toHaveBeenCalledWith({
			where: { id: location.id, ownerUserId: currentUser.id },
		});
	});

	it('does not delete a location without ownership', async () => {
		mocks.findFirstLocation.mockResolvedValue(null);

		await expect(deleteLocationForCurrentUser(location.id)).rejects.toThrow();
		expect(mocks.deleteLocations).not.toHaveBeenCalled();
	});
});
