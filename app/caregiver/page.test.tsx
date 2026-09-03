import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	CaregiverStatus,
	VerificationDocumentStatus,
	VerificationDocumentType,
} from '@/generated/prisma/enums';
import { caregiverText } from '@/lib/content/caregiver-text';

const mocks = vi.hoisted(() => ({ getProfile: vi.fn() }));

vi.mock('@/lib/data/caregivers', () => ({
	getCaregiverProfileForCurrentUser: mocks.getProfile,
}));

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

const routesFixture = {
	caregiverOnboarding: '/caregiver/onboarding',
};

describe('CaregiverPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows the caregiver profile, vehicle, rate, and verification documents', async () => {
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

	it('invites a user without a profile to start caregiver onboarding', async () => {
		mocks.getProfile.mockResolvedValue(null);

		render(await CaregiverPage());

		expect(screen.getByRole('heading', { name: caregiverText.invitation.title })).toBeDefined();
		expect(
			screen.getByRole('link', { name: caregiverText.invitation.cta }).getAttribute('href'),
		).toBe(routesFixture.caregiverOnboarding);
	});
});
