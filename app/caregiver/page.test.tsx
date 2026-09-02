import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	CaregiverStatus,
	VerificationDocumentStatus,
	VerificationDocumentType,
} from '@/generated/prisma/enums';
import { caregiverText } from '@/lib/content/caregiver-text';

const mocks = vi.hoisted(() => ({ hasRole: vi.fn(), getProfile: vi.fn(), redirect: vi.fn() }));

vi.mock('@/lib/auth/roles', () => ({ hasRole: mocks.hasRole }));
vi.mock('@/lib/data/caregivers', () => ({
	getCaregiverProfileForCurrentUser: mocks.getProfile,
}));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

import CaregiverPage from './page';

const profileFixture = {
	status: CaregiverStatus.VERIFIED,
	bio: 'Experienced caregiver',
	hourlyRateCents: 2550,
	vehicleYear: 2022,
	vehicleColor: 'Blue',
	vehicleMake: 'Honda',
	vehicleModel: 'Odyssey',
	verificationDocuments: [
		{
			id: 'document-1',
			type: VerificationDocumentType.DRIVERS_LICENSE,
			status: VerificationDocumentStatus.APPROVED,
		},
	],
};

describe('CaregiverPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.redirect.mockImplementation(() => {
			throw new Error('NEXT_REDIRECT');
		});
	});

	it('shows the caregiver profile, vehicle, rate, and verification documents', async () => {
		mocks.hasRole.mockResolvedValue(true);
		mocks.getProfile.mockResolvedValue(profileFixture);

		render(await CaregiverPage());

		expect(screen.getByRole('heading', { name: caregiverText.profile.title })).toBeDefined();
		expect(screen.getByText(profileFixture.bio)).toBeDefined();
		expect(screen.getByText(caregiverText.profile.rate)).toBeDefined();
		expect(
			screen.getByText(
				`${profileFixture.vehicleYear} ${profileFixture.vehicleColor} ${profileFixture.vehicleMake} ${profileFixture.vehicleModel}`,
			),
		).toBeDefined();
		expect(
			screen.getByText(
				caregiverText.profile.documentTypeLabels[profileFixture.verificationDocuments[0].type],
			),
		).toBeDefined();
	});

	it('shows empty profile states', async () => {
		mocks.hasRole.mockResolvedValue(true);
		mocks.getProfile.mockResolvedValue({
			...profileFixture,
			bio: null,
			vehicleYear: null,
			vehicleColor: null,
			vehicleMake: null,
			vehicleModel: null,
			verificationDocuments: [],
		});

		render(await CaregiverPage());

		expect(screen.getByText(caregiverText.profile.noVehicle)).toBeDefined();
		expect(screen.getByText(caregiverText.profile.noDocuments)).toBeDefined();
	});

	it('redirects a user without the caregiver role to onboarding', async () => {
		mocks.hasRole.mockResolvedValue(false);
		mocks.getProfile.mockResolvedValue(null);

		await expect(CaregiverPage()).rejects.toThrow();

		expect(mocks.redirect).toHaveBeenCalledWith('/caregiver/onboarding');
	});

	it('redirects a caregiver without a profile to onboarding', async () => {
		mocks.hasRole.mockResolvedValue(true);
		mocks.getProfile.mockResolvedValue(null);

		await expect(CaregiverPage()).rejects.toThrow();

		expect(mocks.redirect).toHaveBeenCalledWith('/caregiver/onboarding');
	});
});
