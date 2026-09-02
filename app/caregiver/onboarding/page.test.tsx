import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { caregiverText } from '@/lib/content/caregiver-text';

const mocks = vi.hoisted(() => ({ getProfile: vi.fn(), redirect: vi.fn() }));

vi.mock('@/lib/data/caregivers', () => ({
	getCaregiverProfileForCurrentUser: mocks.getProfile,
}));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

import CaregiverOnboardingPage from './page';

describe('CaregiverOnboardingPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.redirect.mockImplementation(() => {
			throw new Error('NEXT_REDIRECT');
		});
	});

	it('shows the caregiver onboarding form when no profile exists', async () => {
		mocks.getProfile.mockResolvedValue(null);

		render(await CaregiverOnboardingPage());

		expect(screen.getByRole('heading', { name: caregiverText.onboarding.title })).toBeDefined();
		expect(screen.getByText(caregiverText.onboarding.description)).toBeDefined();
		expect(screen.getByRole('button', { name: caregiverText.onboarding.submit })).toBeDefined();
	});

	it('redirects an existing caregiver profile', async () => {
		mocks.getProfile.mockResolvedValue({ id: 'profile-1' });

		await expect(CaregiverOnboardingPage()).rejects.toThrow();

		expect(mocks.redirect).toHaveBeenCalledWith('/caregiver');
	});
});
