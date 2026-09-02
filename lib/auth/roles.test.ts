import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '@/generated/prisma/enums';

const mocks = vi.hoisted(() => ({ getCurrentUser: vi.fn() }));

vi.mock('@/lib/auth/current-user', () => ({ getCurrentUser: mocks.getCurrentUser }));

import { hasRole, requireRole } from './roles';

const userFixture = { roles: [UserRole.PARENT, UserRole.CAREGIVER] };

describe('role authorization', () => {
	beforeEach(() => vi.clearAllMocks());

	it('recognizes a role assigned to the current user', async () => {
		mocks.getCurrentUser.mockResolvedValue(userFixture);

		await expect(hasRole(UserRole.CAREGIVER)).resolves.toBe(true);
	});

	it('returns false when there is no current user', async () => {
		mocks.getCurrentUser.mockResolvedValue(null);

		await expect(hasRole(UserRole.CAREGIVER)).resolves.toBe(false);
	});

	it('rejects access when the current user lacks the required role', async () => {
		mocks.getCurrentUser.mockResolvedValue({ roles: [UserRole.PARENT] });

		await expect(requireRole(UserRole.CAREGIVER)).rejects.toThrow('Forbidden');
	});

	it('allows access when the current user has the required role', async () => {
		mocks.getCurrentUser.mockResolvedValue(userFixture);

		await expect(requireRole(UserRole.CAREGIVER)).resolves.toBeUndefined();
	});
});
