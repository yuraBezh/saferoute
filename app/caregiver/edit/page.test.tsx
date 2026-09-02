import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { caregiverText } from '@/lib/content/caregiver-text';

const mocks = vi.hoisted(() => ({ requireRole: vi.fn(), getProfile: vi.fn(), redirect: vi.fn() }));

vi.mock('@/lib/auth/roles', () => ({ requireRole: mocks.requireRole }));
vi.mock('@/lib/data/caregivers', () => ({
	getCaregiverProfileForCurrentUser: mocks.getProfile,
}));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

import EditCaregiverPage from './page';

const profileFixture = {
	bio: 'Experienced caregiver',
	hourlyRateCents: 2550,
	vehicleMake: 'Honda',
	vehicleModel: 'Odyssey',
	vehicleYear: 2022,
	vehicleColor: 'Blue',
	licensePlate: 'SAFE-123',
};
const hourlyRateInputFixture = '25.50';

describe('EditCaregiverPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.redirect.mockImplementation(() => {
			throw new Error('NEXT_REDIRECT');
		});
	});

	it('shows the current caregiver profile values', async () => {
		mocks.getProfile.mockResolvedValue(profileFixture);

		render(await EditCaregiverPage());

		expect(screen.getByRole('heading', { name: caregiverText.edit.title })).toBeDefined();
		expect(
			(screen.getByLabelText(caregiverText.fields.hourlyRate.label) as HTMLInputElement).value,
		).toBe(hourlyRateInputFixture);
		expect(
			(
				screen.getByLabelText(caregiverText.fields.vehicleMake.label, {
					exact: false,
				}) as HTMLInputElement
			).value,
		).toBe(profileFixture.vehicleMake);
	});

	it('redirects to onboarding when the caregiver profile is missing', async () => {
		mocks.getProfile.mockResolvedValue(null);

		await expect(EditCaregiverPage()).rejects.toThrow();

		expect(mocks.redirect).toHaveBeenCalledWith('/caregiver/onboarding');
	});
});
