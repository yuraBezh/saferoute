import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth/current-user';
import { type ChildInput, type CreateChildInput } from '@/lib/validation/child';

export async function getChildrenForCurrentUser() {
	const userId = await getCurrentUserId();

	return await prisma.child.findMany({
		where: {
			guardians: { some: { userId } },
		},
		include: {
			_count: { select: { guardians: true } },
		},
	});
}

function toChildData(data: ChildInput) {
	return {
		firstName: data.firstName,
		lastName: data.lastName,
		birthDate: new Date(`${data.birthDate}T00:00:00.000Z`),
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
		where: {
			id,
			guardians: { some: { userId } },
		},
		include: {
			guardians: {
				include: { user: true },
				orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
			},
		},
	});
}

export async function updateChildForCurrentUser(id: string, data: ChildInput) {
	const userId = await getCurrentUserId();

	return prisma.child.updateMany({
		where: { id, guardians: { some: { userId } } },
		data: toChildData(data),
	});
}

export async function deleteChildForCurrentUser(id: string) {
	const userId = await getCurrentUserId();

	return prisma.child.deleteMany({
		where: { id, guardians: { some: { userId } } },
	});
}
