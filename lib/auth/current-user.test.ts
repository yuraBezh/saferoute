import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ auth: vi.fn() }));

vi.mock('@/auth', () => ({ auth: mocks.auth }));

import { getCurrentUser, getCurrentUserId } from './current-user';

const userFixture = {
	id: 'user-1',
	name: 'Ada Lovelace',
	email: 'ada@example.com',
};

describe('current user', () => {
	beforeEach(() => {
		mocks.auth.mockReset();
	});

	it('returns the authenticated user', async () => {
		mocks.auth.mockResolvedValue({ user: userFixture });

		await expect(getCurrentUser()).resolves.toBe(userFixture);
	});

	it('returns null when there is no authenticated user', async () => {
		mocks.auth.mockResolvedValue(null);

		await expect(getCurrentUser()).resolves.toBeNull();
	});

	it('returns the authenticated user id', async () => {
		mocks.auth.mockResolvedValue({ user: userFixture });

		await expect(getCurrentUserId()).resolves.toBe(userFixture.id);
	});

	it('rejects a missing session', async () => {
		mocks.auth.mockResolvedValue(null);

		await expect(getCurrentUserId()).rejects.toThrow();
	});

	it('rejects a session without a user id', async () => {
		const userWithoutIdFixture = { ...userFixture, id: undefined };
		mocks.auth.mockResolvedValue({ user: userWithoutIdFixture });

		await expect(getCurrentUserId()).rejects.toThrow();
	});
});
