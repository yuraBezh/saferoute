import { beforeEach, describe, expect, it, vi } from 'vitest';
import { caregiverText } from '@/lib/content/caregiver-text';

const mocks = vi.hoisted(() => ({
	createProfile: vi.fn(),
	updateProfile: vi.fn(),
	revalidatePath: vi.fn(),
	redirect: vi.fn(),
}));

vi.mock('@/lib/data/caregivers', () => ({
	createCaregiverProfileForCurrentUser: mocks.createProfile,
	updateCaregiverProfileForCurrentUser: mocks.updateProfile,
}));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

import {
	createCaregiverProfileAction,
	type CaregiverFormState,
	updateCaregiverProfileAction,
} from './actions';

const initialState: CaregiverFormState = { message: '', errors: {} };
const profileFixture = {
	bio: '  Experienced caregiver  ',
	hourlyRate: '25.50',
	vehicleMake: ' Honda ',
	vehicleModel: 'Odyssey',
	vehicleYear: String(new Date().getFullYear() - 5),
	vehicleColor: 'Blue',
	licensePlate: 'SAFE-123',
};

const createFormData = (values: Record<string, string>) => {
	const formData = new FormData();
	for (const [key, value] of Object.entries(values)) formData.set(key, value);
	return formData;
};

describe('caregiver profile actions', () => {
	beforeEach(() => vi.clearAllMocks());

	it('returns field errors without creating an invalid profile', async () => {
		const result = await createCaregiverProfileAction(
			initialState,
			createFormData({ ...profileFixture, hourlyRate: '' }),
		);

		expect(result.message).toBe(caregiverText.validationError);
		expect(result.errors?.hourlyRate?.[0]).toBe(caregiverText.fields.hourlyRate.required);
		expect(mocks.createProfile).not.toHaveBeenCalled();
	});

	it('creates a normalized profile and redirects to it', async () => {
		await createCaregiverProfileAction(initialState, createFormData(profileFixture));

		expect(mocks.createProfile).toHaveBeenCalledWith({
			...profileFixture,
			bio: profileFixture.bio.trim(),
			vehicleMake: profileFixture.vehicleMake.trim(),
			vehicleYear: Number(profileFixture.vehicleYear),
		});
		expect(mocks.revalidatePath).toHaveBeenCalledWith('/caregiver');
		expect(mocks.redirect).toHaveBeenCalledWith('/caregiver');
	});

	it('returns a general message when profile creation fails', async () => {
		const errorFixture = new Error('Database unavailable');
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		mocks.createProfile.mockRejectedValue(errorFixture);

		await expect(
			createCaregiverProfileAction(initialState, createFormData(profileFixture)),
		).resolves.toEqual({ message: caregiverText.onboarding.saveError, errors: {} });
		consoleError.mockRestore();
	});

	it('updates a valid profile and redirects', async () => {
		mocks.updateProfile.mockResolvedValue({ count: 1 });

		await updateCaregiverProfileAction(initialState, createFormData(profileFixture));

		expect(mocks.updateProfile).toHaveBeenCalled();
		expect(mocks.revalidatePath).toHaveBeenCalledWith('/caregiver');
		expect(mocks.redirect).toHaveBeenCalledWith('/caregiver');
	});

	it('returns a general message when no accessible profile is updated', async () => {
		mocks.updateProfile.mockResolvedValue({ count: 0 });

		await expect(
			updateCaregiverProfileAction(initialState, createFormData(profileFixture)),
		).resolves.toEqual({ message: caregiverText.edit.saveError, errors: {} });
		expect(mocks.redirect).not.toHaveBeenCalled();
	});

	it('returns a general message when profile update fails', async () => {
		const errorFixture = new Error('Forbidden');
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		mocks.updateProfile.mockRejectedValue(errorFixture);

		await expect(
			updateCaregiverProfileAction(initialState, createFormData(profileFixture)),
		).resolves.toEqual({ message: caregiverText.edit.saveError, errors: {} });
		consoleError.mockRestore();
	});
});
