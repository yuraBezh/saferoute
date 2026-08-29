import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth/current-user';
import { type ChildInput } from '@/lib/validation/child';

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

export async function createChildForCurrentUser(data: ChildInput) {
	const userId = await getCurrentUserId();

	await prisma.child.create({
		data: {
			...toChildData(data),
			guardians: {
				create: {
					userId,
					relationship: 'GUARDIAN',
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

export async function requireChildAccess(id: string) {
	const child = await getChildForCurrentUser(id);

	if (!child) {
		throw new Error('Child not found or access denied');
	}

	return child;
}

export async function updateChildForCurrentUser(id: string, data: ChildInput) {
	await requireChildAccess(id);

	return prisma.child.update({
		where: { id },
		data: toChildData(data),
	});
}

export async function deleteChildForCurrentUser(id: string) {
	await requireChildAccess(id);

	return prisma.child.delete({ where: { id } });
}
