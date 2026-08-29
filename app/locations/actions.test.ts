import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocationType } from '@/generated/prisma/enums';
import {
	createLocationFormText,
	editLocationFormText,
	locationFormText,
} from '@/lib/content/location-form-text';

const mocks = vi.hoisted(() => ({
	createLocationForCurrentUser: vi.fn(),
	updateLocationForCurrentUser: vi.fn(),
	deleteLocationForCurrentUser: vi.fn(),
	revalidatePath: vi.fn(),
	redirect: vi.fn(),
}));

vi.mock('@/lib/data/locations', () => ({
	createLocationForCurrentUser: mocks.createLocationForCurrentUser,
	updateLocationForCurrentUser: mocks.updateLocationForCurrentUser,
	deleteLocationForCurrentUser: mocks.deleteLocationForCurrentUser,
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
	});

	it('returns field errors without writing invalid data', async () => {
		const result = await createLocationAction(
			initialState,
			createFormData({ ...location, state: '' }),
		);

		expect(result.message).toBe(locationFormText.validationError);
		expect(result.errors?.state?.[0]).toBe(
			locationFormText.fields.state.invalid,
		);
		expect(mocks.createLocationForCurrentUser).not.toHaveBeenCalled();
		expect(mocks.redirect).not.toHaveBeenCalled();
	});

	it('normalizes values, assigns the current owner, and redirects', async () => {
		mocks.createLocationForCurrentUser.mockResolvedValue({});

		await createLocationAction(
			initialState,
			createFormData({
				...location,
				name: `  ${location.name}  `,
				addressLine2: '',
			}),
		);

		expect(mocks.createLocationForCurrentUser).toHaveBeenCalledWith({
			type: location.type,
			name: location.name,
			addressLine1: location.addressLine1,
			addressLine2: undefined,
			city: location.city,
			state: location.state.toUpperCase(),
			postalCode: location.postalCode,
		});
		expect(mocks.revalidatePath).toHaveBeenCalledWith('/locations');
		expect(mocks.redirect).toHaveBeenCalledWith('/locations');
	});

	it('returns a general message when saving fails', async () => {
		const error = new Error('Database unavailable');
		const consoleError = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);
		mocks.createLocationForCurrentUser.mockRejectedValue(error);

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
	});

	it('updates validated location data and redirects', async () => {
		mocks.updateLocationForCurrentUser.mockResolvedValue({ count: 1 });

		await editLocationAction(
			location.id,
			initialState,
			createFormData(location),
		);

		expect(mocks.updateLocationForCurrentUser).toHaveBeenCalledWith(
			location.id,
			{
				type: location.type,
				name: location.name,
				addressLine1: location.addressLine1,
				addressLine2: undefined,
				city: location.city,
				state: location.state.toUpperCase(),
				postalCode: location.postalCode,
			},
		);
		expect(mocks.revalidatePath).toHaveBeenCalledWith('/locations');
		expect(mocks.redirect).toHaveBeenCalledWith('/locations');
	});

	it('returns a not-found message when no owned location is updated', async () => {
		mocks.updateLocationForCurrentUser.mockResolvedValue({ count: 0 });

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
	});

	it('deletes the location and redirects', async () => {
		mocks.deleteLocationForCurrentUser.mockResolvedValue({ count: 1 });

		await deleteLocationAction(location.id);

		expect(mocks.deleteLocationForCurrentUser).toHaveBeenCalledWith(
			location.id,
		);
		expect(mocks.revalidatePath).toHaveBeenCalledWith('/locations');
		expect(mocks.redirect).toHaveBeenCalledWith('/locations');
	});

	it('does not redirect when no owned location was deleted', async () => {
		mocks.deleteLocationForCurrentUser.mockResolvedValue({ count: 0 });

		await expect(deleteLocationAction(location.id)).rejects.toThrow();
		expect(mocks.revalidatePath).not.toHaveBeenCalled();
		expect(mocks.redirect).not.toHaveBeenCalled();
	});
});
