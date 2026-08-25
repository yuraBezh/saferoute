import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocationType } from '@/generated/prisma/enums';
import {
	createLocationFormText,
	editLocationFormText,
	locationFormText,
} from '@/lib/content/location-form-text';

const mocks = vi.hoisted(() => ({
	createLocation: vi.fn(),
	updateLocations: vi.fn(),
	deleteLocations: vi.fn(),
	getCurrentUserId: vi.fn(),
	revalidatePath: vi.fn(),
	redirect: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
	prisma: {
		location: {
			create: mocks.createLocation,
			updateMany: mocks.updateLocations,
			deleteMany: mocks.deleteLocations,
		},
	},
}));

vi.mock('@/lib/auth/current-user', () => ({
	getCurrentUserId: mocks.getCurrentUserId,
}));

vi.mock('next/cache', () => ({
	revalidatePath: mocks.revalidatePath,
}));

vi.mock('next/navigation', () => ({
	redirect: mocks.redirect,
}));

import {
	createLocationAction,
	deleteLocationAction,
	editLocationAction,
	type LocationFormState,
} from '@/app/locations/actions';

const initialState: LocationFormState = { message: '', errors: {} };
const location = {
	id: 'location-1',
	type: LocationType.SCHOOL,
	name: 'Lincoln Elementary',
	addressLine1: '123 Main St',
	addressLine2: '',
	city: 'Chicago',
	state: 'il',
	postalCode: '60601',
};
const currentUser = { id: 'user-1' };

function createFormData(values: Record<string, string>) {
	const formData = new FormData();

	for (const [key, value] of Object.entries(values)) {
		formData.set(key, value);
	}

	return formData;
}

describe('createLocationAction', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getCurrentUserId.mockResolvedValue(currentUser.id);
	});

	it('returns field errors without authenticating or writing invalid data', async () => {
		const result = await createLocationAction(
			initialState,
			createFormData({ ...location, state: '' }),
		);

		expect(result.message).toBe(locationFormText.validationError);
		expect(result.errors?.state?.[0]).toBe(
			locationFormText.fields.state.invalid,
		);
		expect(mocks.getCurrentUserId).not.toHaveBeenCalled();
		expect(mocks.createLocation).not.toHaveBeenCalled();
		expect(mocks.redirect).not.toHaveBeenCalled();
	});

	it('normalizes values, assigns the current owner, and redirects', async () => {
		mocks.createLocation.mockResolvedValue({});

		await createLocationAction(
			initialState,
			createFormData({
				...location,
				name: `  ${location.name}  `,
				addressLine2: '',
			}),
		);

		expect(mocks.createLocation).toHaveBeenCalledWith({
			data: {
				type: location.type,
				name: location.name,
				addressLine1: location.addressLine1,
				addressLine2: undefined,
				city: location.city,
				state: location.state.toUpperCase(),
				postalCode: location.postalCode,
				ownerUserId: currentUser.id,
			},
		});
		expect(mocks.revalidatePath).toHaveBeenCalledWith('/locations');
		expect(mocks.redirect).toHaveBeenCalledWith('/locations');
	});

	it('returns a general message when saving fails', async () => {
		const error = new Error('Database unavailable');
		const consoleError = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);
		mocks.createLocation.mockRejectedValue(error);

		const result = await createLocationAction(
			initialState,
			createFormData(location),
		);

		expect(result).toEqual({
			message: createLocationFormText.saveError,
			errors: {},
		});
		expect(consoleError).toHaveBeenCalledWith(
			'Failed to create location',
			error,
		);
		expect(mocks.redirect).not.toHaveBeenCalled();
		consoleError.mockRestore();
	});
});

describe('editLocationAction', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getCurrentUserId.mockResolvedValue(currentUser.id);
	});

	it('updates only a location owned by the current user', async () => {
		mocks.updateLocations.mockResolvedValue({ count: 1 });

		await editLocationAction(
			location.id,
			initialState,
			createFormData(location),
		);

		expect(mocks.updateLocations).toHaveBeenCalledWith({
			where: { id: location.id, ownerUserId: currentUser.id },
			data: {
				type: location.type,
				name: location.name,
				addressLine1: location.addressLine1,
				addressLine2: undefined,
				city: location.city,
				state: location.state.toUpperCase(),
				postalCode: location.postalCode,
			},
		});
		expect(mocks.revalidatePath).toHaveBeenCalledWith('/locations');
		expect(mocks.redirect).toHaveBeenCalledWith('/locations');
	});

	it('returns a not-found message when no owned location is updated', async () => {
		mocks.updateLocations.mockResolvedValue({ count: 0 });

		const result = await editLocationAction(
			location.id,
			initialState,
			createFormData(location),
		);

		expect(result).toEqual({
			message: editLocationFormText.notFoundError,
			errors: {},
		});
		expect(mocks.revalidatePath).not.toHaveBeenCalled();
		expect(mocks.redirect).not.toHaveBeenCalled();
	});
});

describe('deleteLocationAction', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getCurrentUserId.mockResolvedValue(currentUser.id);
	});

	it('deletes only a location owned by the current user', async () => {
		mocks.deleteLocations.mockResolvedValue({ count: 1 });

		await deleteLocationAction(location.id);

		expect(mocks.deleteLocations).toHaveBeenCalledWith({
			where: { id: location.id, ownerUserId: currentUser.id },
		});
		expect(mocks.revalidatePath).toHaveBeenCalledWith('/locations');
		expect(mocks.redirect).toHaveBeenCalledWith('/locations');
	});
});
