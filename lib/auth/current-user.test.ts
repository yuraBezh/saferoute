import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), findUnique: vi.fn() }));

vi.mock('@/auth', () => ({ auth: mocks.auth }));
vi.mock('@/lib/prisma', () => ({
	prisma: { user: { findUnique: mocks.findUnique } },
}));

import { getCurrentUser, getCurrentUserId } from './current-user';

const userFixture = {
	id: 'user-1',
	email: 'ada@example.com',
	fullName: 'Ada Lovelace',
	avatarUrl: null,
	roles: ['PARENT'],
};

const currentUserFixture = {
	id: userFixture.id,
	email: userFixture.email,
	name: userFixture.fullName,
	image: userFixture.avatarUrl,
	roles: userFixture.roles,
};

describe('current user', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns the authenticated user', async () => {
		mocks.auth.mockResolvedValue({ user: userFixture });

		mocks.findUnique.mockResolvedValue(userFixture);

		await expect(getCurrentUser()).resolves.toEqual(currentUserFixture);
		expect(mocks.findUnique).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: userFixture.id },
			}),
		);
	});

	it('returns null when there is no authenticated user', async () => {
		mocks.auth.mockResolvedValue(null);

		await expect(getCurrentUser()).resolves.toBeNull();
	});

	it('returns the authenticated user id', async () => {
		mocks.auth.mockResolvedValue({ user: userFixture });
		mocks.findUnique.mockResolvedValue(userFixture);

		await expect(getCurrentUserId()).resolves.toBe(userFixture.id);
	});

	it('rejects a missing session', async () => {
		mocks.auth.mockResolvedValue(null);

		await expect(getCurrentUserId()).rejects.toThrow();
	});

	it('rejects a session without a user id', async () => {
		const userWithoutIdFixture = { ...currentUserFixture, id: undefined };
		mocks.auth.mockResolvedValue({ user: userWithoutIdFixture });

		await expect(getCurrentUserId()).rejects.toThrow();
	});
});
