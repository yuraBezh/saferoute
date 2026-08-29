import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GuardianRelationship } from '@/generated/prisma/enums';
import type { ChildInput } from '@/lib/validation/child';

const mocks = vi.hoisted(() => ({
	getCurrentUserId: vi.fn(),
	findManyChildren: vi.fn(),
	findFirstChild: vi.fn(),
	createChild: vi.fn(),
	updateChild: vi.fn(),
	deleteChild: vi.fn(),
}));

vi.mock('@/lib/auth/current-user', () => ({
	getCurrentUserId: mocks.getCurrentUserId,
}));

vi.mock('@/lib/prisma', () => ({
	prisma: {
		child: {
			findMany: mocks.findManyChildren,
			findFirst: mocks.findFirstChild,
			create: mocks.createChild,
			update: mocks.updateChild,
			delete: mocks.deleteChild,
		},
	},
}));

import {
	createChildForCurrentUser,
	deleteChildForCurrentUser,
	getChildForCurrentUser,
	getChildrenForCurrentUser,
	updateChildForCurrentUser,
} from '@/lib/data/children';

const currentUser = { id: 'user-1' };
const childInput: ChildInput = {
	firstName: 'Miles',
	lastName: 'Davis',
	birthDate: '2019-08-29',
};
const child = {
	id: 'child-1',
	...childInput,
	birthDate: new Date(`${childInput.birthDate}T00:00:00.000Z`),
	guardians: [],
};

describe('children data access', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getCurrentUserId.mockResolvedValue(currentUser.id);
	});

	it('lists only children guarded by the current user', async () => {
		const children = [child];
		mocks.findManyChildren.mockResolvedValue(children);

		await expect(getChildrenForCurrentUser()).resolves.toBe(children);
		expect(mocks.findManyChildren).toHaveBeenCalledWith({
			where: { guardians: { some: { userId: currentUser.id } } },
			include: { _count: { select: { guardians: true } } },
		});
	});

	it('creates the child and current user guardian together', async () => {
		mocks.createChild.mockResolvedValue(child);

		await createChildForCurrentUser(childInput);

		expect(mocks.createChild).toHaveBeenCalledWith({
			data: {
				firstName: childInput.firstName,
				lastName: childInput.lastName,
				birthDate: child.birthDate,
				guardians: {
					create: {
						userId: currentUser.id,
						relationship: GuardianRelationship.GUARDIAN,
						isPrimary: true,
					},
				},
			},
		});
	});

	it('loads a child only through the current user guardian relationship', async () => {
		mocks.findFirstChild.mockResolvedValue(child);

		await expect(getChildForCurrentUser(child.id)).resolves.toBe(child);
		expect(mocks.findFirstChild).toHaveBeenCalledWith({
			where: {
				id: child.id,
				guardians: { some: { userId: currentUser.id } },
			},
			include: {
				guardians: {
					include: { user: true },
					orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
				},
			},
		});
	});

	it('updates a child after confirming guardian access', async () => {
		mocks.findFirstChild.mockResolvedValue(child);
		mocks.updateChild.mockResolvedValue(child);

		await updateChildForCurrentUser(child.id, childInput);

		expect(mocks.updateChild).toHaveBeenCalledWith({
			where: { id: child.id },
			data: {
				firstName: childInput.firstName,
				lastName: childInput.lastName,
				birthDate: child.birthDate,
			},
		});
	});

	it('does not update a child without guardian access', async () => {
		mocks.findFirstChild.mockResolvedValue(null);

		await expect(
			updateChildForCurrentUser(child.id, childInput),
		).rejects.toThrow();
		expect(mocks.updateChild).not.toHaveBeenCalled();
	});

	it('deletes a child after confirming guardian access', async () => {
		mocks.findFirstChild.mockResolvedValue(child);
		mocks.deleteChild.mockResolvedValue(child);

		await deleteChildForCurrentUser(child.id);

		expect(mocks.deleteChild).toHaveBeenCalledWith({
			where: { id: child.id },
		});
	});
});
