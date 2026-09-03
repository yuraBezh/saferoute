import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '@/generated/prisma/enums';
import { landingText } from '@/lib/content/landing-text';

const mocks = vi.hoisted(() => ({ redirect: vi.fn(), getCurrentUser: vi.fn(), signIn: vi.fn() }));

vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));
vi.mock('@/lib/auth/current-user', () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock('@/auth', () => ({ signIn: mocks.signIn }));

import Home, { becomeCaregiverAction, findCaregiverAction } from './page';

const userFixture = {
	id: 'user-1',
	name: 'Ada Lovelace',
	email: 'ada@example.com',
	image: null,
	roles: [UserRole.PARENT],
};

const routesFixture = {
	children: '/children',
	caregiver: '/caregiver',
	caregiverOnboarding: '/caregiver/onboarding',
};

describe('Home', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.redirect.mockImplementation(() => {
			throw new Error('NEXT_REDIRECT');
		});
	});

	it('shows the landing page to an unauthenticated visitor', async () => {
		mocks.getCurrentUser.mockResolvedValue(null);

		render(await Home());

		expect(screen.getByRole('heading', { name: landingText.hero.title })).toBeDefined();
		expect(screen.getByRole('button', { name: landingText.hero.findCaregiver })).toBeDefined();
		expect(screen.getByRole('button', { name: landingText.hero.becomeCaregiver })).toBeDefined();
	});

	it('redirects a parent to the children page', async () => {
		mocks.getCurrentUser.mockResolvedValue(userFixture);

		await expect(Home()).rejects.toThrow();

		expect(mocks.redirect).toHaveBeenCalledWith(routesFixture.children);
		expect(mocks.redirect).toHaveBeenCalledOnce();
	});

	it('redirects a caregiver to the caregiver page', async () => {
		mocks.getCurrentUser.mockResolvedValue({ ...userFixture, roles: [UserRole.CAREGIVER] });

		await expect(Home()).rejects.toThrow();

		expect(mocks.redirect).toHaveBeenCalledWith(routesFixture.caregiver);
		expect(mocks.redirect).toHaveBeenCalledOnce();
	});

	it('starts the family Google sign-in flow', async () => {
		await findCaregiverAction();

		expect(mocks.signIn).toHaveBeenCalledWith('google', {
			redirectTo: routesFixture.children,
		});
	});

	it('starts the caregiver Google sign-in flow', async () => {
		await becomeCaregiverAction();

		expect(mocks.signIn).toHaveBeenCalledWith('google', {
			redirectTo: routesFixture.caregiverOnboarding,
		});
	});
});
