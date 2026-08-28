import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ auth: vi.fn() }));

vi.mock('@/auth', () => ({ auth: mocks.auth }));

import { getCurrentUserId } from './current-user';

const userFixture = {
	id: 'user-1',
	name: 'Ada Lovelace',
	email: 'ada@example.com',
};

describe('getCurrentUserId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
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
