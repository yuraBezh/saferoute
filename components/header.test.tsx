import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { headerText } from '@/lib/content/header-text';
import { UserRole } from '@/generated/prisma/enums';

const {
	brand,
	signIn,
	signOut,
	fallbackInitial,
	navigation: { children, locations, assignments, profile, becomeCaregiver },
} = headerText;

const mocks = vi.hoisted(() => ({
	getCurrentUser: vi.fn(),
	signOut: vi.fn(),
}));

vi.mock('@/auth', () => ({
	signOut: mocks.signOut,
}));
vi.mock('@/lib/auth/current-user', () => ({
	getCurrentUser: mocks.getCurrentUser,
}));

import { Header, signOutAction } from './header';

const userFixture = {
	id: 'user-1',
	name: 'Ada Lovelace',
	email: 'ada@example.com',
	image: null,
	roles: [UserRole.PARENT],
};

const routesFixture = {
	home: '/',
	children: '/children',
	locations: '/locations',
	signInForParent: '/signin?callbackUrl=/children',
	caregiverOnboarding: '/caregiver/onboarding',
};

describe('Header', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows the public header to an unauthenticated visitor', async () => {
		mocks.getCurrentUser.mockResolvedValue(null);

		render(await Header());

		expect(screen.getByRole('link', { name: brand })).toBeDefined();
		expect(screen.getByRole('link', { name: signIn }).getAttribute('href')).toBe(
			routesFixture.signInForParent,
		);
		expect(mocks.getCurrentUser).toHaveBeenCalledOnce();
	});

	it('shows navigation and account details for the authenticated user', async () => {
		mocks.getCurrentUser.mockResolvedValue(userFixture);

		render(await Header());
		const initials = userFixture.name
			.split(' ')
			.map((part) => part[0])
			.slice(0, 2)
			.join('')
			.toUpperCase();

		expect(screen.getByText(initials)).toBeDefined();
		expect(screen.getByText(userFixture.name)).toBeDefined();
		expect(screen.getByRole('link', { name: brand }).getAttribute('href')).toBe(routesFixture.home);
		expect(screen.getByRole('link', { name: children }).getAttribute('href')).toBe(
			routesFixture.children,
		);
		expect(screen.getByRole('link', { name: locations }).getAttribute('href')).toBe(
			routesFixture.locations,
		);
		expect(screen.getByRole('button', { name: signOut })).toBeDefined();
		expect(screen.getByRole('link', { name: becomeCaregiver }).getAttribute('href')).toBe(
			routesFixture.caregiverOnboarding,
		);
	});

	it('uses the email for initials when the user has no name', async () => {
		const userWithoutNameFixture = { ...userFixture, name: null };
		mocks.getCurrentUser.mockResolvedValue(userWithoutNameFixture);

		render(await Header());

		expect(screen.getByText(userWithoutNameFixture.email[0].toUpperCase())).toBeDefined();
	});

	it('shows only caregiver navigation to a caregiver-only user', async () => {
		mocks.getCurrentUser.mockResolvedValue({
			...userFixture,
			roles: [UserRole.CAREGIVER],
		});

		render(await Header());

		expect(screen.getByRole('link', { name: assignments })).toBeDefined();
		expect(screen.getByRole('link', { name: profile })).toBeDefined();
		expect(screen.queryByRole('link', { name: children })).toBeNull();
		expect(screen.queryByRole('link', { name: locations })).toBeNull();
		expect(screen.queryByRole('link', { name: becomeCaregiver })).toBeNull();
	});

	it('shows parent and caregiver navigation to a dual-role user', async () => {
		mocks.getCurrentUser.mockResolvedValue({
			...userFixture,
			roles: [UserRole.PARENT, UserRole.CAREGIVER],
		});

		render(await Header());

		for (const label of [children, locations, assignments, profile]) {
			expect(screen.getByRole('link', { name: label })).toBeDefined();
		}
		expect(screen.queryByRole('link', { name: becomeCaregiver })).toBeNull();
	});

	it('uses a fallback initial when the user has no name or email', async () => {
		const anonymousUserFixture = {
			...userFixture,
			name: null,
			email: null,
		};
		mocks.getCurrentUser.mockResolvedValue(anonymousUserFixture);

		render(await Header());

		expect(screen.getByText(fallbackInitial)).toBeDefined();
	});

	it('signs the user out and redirects to the landing page', async () => {
		mocks.signOut.mockResolvedValue(undefined);

		await signOutAction();

		expect(mocks.signOut).toHaveBeenCalledWith({
			redirectTo: routesFixture.home,
		});
	});
});
