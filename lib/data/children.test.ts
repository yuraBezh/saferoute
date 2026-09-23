import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GuardianRelationship } from '@/generated/prisma/enums';
import type { ChildInput, CreateChildInput } from '@/lib/validation/child';

const mocks = vi.hoisted(() => ({
	getCurrentUserId: vi.fn(),
	findManyChildren: vi.fn(),
	findFirstChild: vi.fn(),
	createChild: vi.fn(),
	updateChildren: vi.fn(),
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
			updateMany: mocks.updateChildren,
		},
	},
}));

import {
	createChildForCurrentUser,
	archiveChildForCurrentUser,
	getChildForCurrentUser,
	getChildrenForCurrentUser,
	ownedChildWhere,
	updateChildForCurrentUser,
} from '@/lib/data/children';

const currentUser = { id: 'user-1' };
const childInput: ChildInput = {
	firstName: 'Miles',
	lastName: 'Davis',
	birthDate: '2019-08-29',
};
const createChildInput: CreateChildInput = {
	...childInput,
	relationship: GuardianRelationship.MOTHER,
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

	it('lists children guarded by the current user in first and last name order', async () => {
		const children = [child];
		mocks.findManyChildren.mockResolvedValue(children);

		await expect(getChildrenForCurrentUser()).resolves.toBe(children);
		expect(mocks.findManyChildren).toHaveBeenCalledWith({
			where: ownedChildWhere(currentUser.id),
			include: { _count: { select: { guardians: true } } },
			orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
		});
	});

	it('creates the child and current user guardian together', async () => {
		mocks.createChild.mockResolvedValue(child);

		await createChildForCurrentUser(createChildInput);

		expect(mocks.createChild).toHaveBeenCalledWith({
			data: {
				firstName: createChildInput.firstName,
				lastName: createChildInput.lastName,
				birthDate: child.birthDate,
				guardians: {
					create: {
						userId: currentUser.id,
						relationship: createChildInput.relationship,
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
			where: ownedChildWhere(currentUser.id, { id: child.id }),
			include: {
				guardians: {
					include: { user: { select: { fullName: true, email: true } } },
					orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
				},
			},
		});
	});

	it('updates a child through an atomic guardian filter', async () => {
		const updateResult = { count: 1 };
		mocks.updateChildren.mockResolvedValue(updateResult);

		await expect(updateChildForCurrentUser(child.id, childInput)).resolves.toBe(updateResult);

		expect(mocks.updateChildren).toHaveBeenCalledWith({
			where: ownedChildWhere(currentUser.id, { id: child.id }),
			data: {
				firstName: childInput.firstName,
				lastName: childInput.lastName,
				birthDate: child.birthDate,
			},
		});
	});

	it('archives a child through an atomic guardian filter instead of deleting the row', async () => {
		const archiveResult = { count: 1 };
		mocks.updateChildren.mockResolvedValue(archiveResult);
		const now = new Date('2026-09-05T14:00:00Z');
		vi.useFakeTimers();
		vi.setSystemTime(now);

		await expect(archiveChildForCurrentUser(child.id)).resolves.toBe(archiveResult);

		expect(mocks.updateChildren).toHaveBeenCalledWith({
			where: ownedChildWhere(currentUser.id, { id: child.id }),
			data: { deletedAt: now },
		});
		vi.useRealTimers();
	});
});
