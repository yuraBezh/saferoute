import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth/current-user';
import { toDbDate } from '@/lib/date';
import { type ChildInput, type CreateChildInput } from '@/lib/validation/child';

export const CHILD_NOT_ARCHIVED = { deletedAt: null } as const;

export function ownedChildWhere(userId: string, options?: { id?: string; canBook?: true }) {
	return {
		...(options?.id ? { id: options.id } : {}),
		...CHILD_NOT_ARCHIVED,
		guardians: { some: options?.canBook ? { userId, canBook: true as const } : { userId } },
	};
}

export async function getChildrenForCurrentUser() {
	const userId = await getCurrentUserId();

	return await prisma.child.findMany({
		where: ownedChildWhere(userId),
		include: {
			_count: { select: { guardians: true } },
		},
		orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
	});
}

function toChildData(data: ChildInput) {
	return {
		firstName: data.firstName,
		lastName: data.lastName,
		birthDate: toDbDate(data.birthDate),
	};
}

export async function createChildForCurrentUser(data: CreateChildInput) {
	const userId = await getCurrentUserId();
	const { relationship, ...childData } = data;

	await prisma.child.create({
		data: {
			...toChildData(childData),
			guardians: {
				create: {
					userId,
					relationship,
					isPrimary: true,
				},
			},
		},
	});
}

export async function getChildForCurrentUser(id: string) {
	const userId = await getCurrentUserId();

	return prisma.child.findFirst({
		where: ownedChildWhere(userId, { id }),
		include: {
			guardians: {
				include: { user: { select: { fullName: true, email: true } } },
				orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
			},
		},
	});
}

export async function updateChildForCurrentUser(id: string, data: ChildInput) {
	const userId = await getCurrentUserId();

	return prisma.child.updateMany({
		where: ownedChildWhere(userId, { id }),
		data: toChildData(data),
	});
}

export async function archiveChildForCurrentUser(id: string) {
	const userId = await getCurrentUserId();

	return prisma.child.updateMany({
		where: ownedChildWhere(userId, { id }),
		data: { deletedAt: new Date() },
	});
}
