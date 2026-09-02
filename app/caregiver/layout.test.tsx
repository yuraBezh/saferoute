import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CaregiverStatus } from '@/generated/prisma/enums';
import { caregiverText } from '@/lib/content/caregiver-text';

const mocks = vi.hoisted(() => ({ hasRole: vi.fn(), getProfile: vi.fn() }));

vi.mock('@/lib/auth/roles', () => ({ hasRole: mocks.hasRole }));
vi.mock('@/lib/data/caregivers', () => ({
	getCaregiverProfileForCurrentUser: mocks.getProfile,
}));

import CaregiverLayout from './layout';

const childFixture = <p data-testid="caregiver-content" />;
const profileFixture = { status: CaregiverStatus.VERIFIED };

describe('CaregiverLayout', () => {
	beforeEach(() => vi.clearAllMocks());

	it('allows onboarding when no caregiver profile exists', async () => {
		mocks.hasRole.mockResolvedValue(false);
		mocks.getProfile.mockResolvedValue(null);

		render(await CaregiverLayout({ children: childFixture }));

		expect(screen.getByTestId('caregiver-content')).toBeDefined();
	});

	it('allows an active caregiver to use the section', async () => {
		mocks.hasRole.mockResolvedValue(true);
		mocks.getProfile.mockResolvedValue(profileFixture);

		render(await CaregiverLayout({ children: childFixture }));

		expect(screen.getByTestId('caregiver-content')).toBeDefined();
	});

	it('denies access when a saved profile has lost its caregiver role', async () => {
		mocks.hasRole.mockResolvedValue(false);
		mocks.getProfile.mockResolvedValue(profileFixture);

		render(await CaregiverLayout({ children: childFixture }));

		expect(screen.getByRole('heading', { name: caregiverText.accessRevoked.title })).toBeDefined();
		expect(screen.getByText(caregiverText.accessRevoked.description)).toBeDefined();
		expect(screen.queryByTestId('caregiver-content')).toBeNull();
	});

	it('denies access to a suspended caregiver', async () => {
		mocks.hasRole.mockResolvedValue(true);
		mocks.getProfile.mockResolvedValue({ status: CaregiverStatus.SUSPENDED });

		render(await CaregiverLayout({ children: childFixture }));

		expect(screen.getByRole('heading', { name: caregiverText.accessRevoked.title })).toBeDefined();
		expect(screen.queryByTestId('caregiver-content')).toBeNull();
	});
});
