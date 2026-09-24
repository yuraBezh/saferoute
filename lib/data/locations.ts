import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth/current-user';
import { LocationInput } from '@/lib/validation/location';

export const LOCATION_NOT_ARCHIVED = { deletedAt: null } as const;

export function ownedLocationWhere(userId: string, options?: { id?: string }) {
	return {
		...(options?.id ? { id: options.id } : {}),
		...LOCATION_NOT_ARCHIVED,
		ownerUserId: userId,
	};
}

export function accessibleLocationWhere(userId: string) {
	return {
		...LOCATION_NOT_ARCHIVED,
		OR: [{ ownerUserId: userId }, { ownerUserId: null }],
	};
}

export async function getLocationsForCurrentUser() {
	const userId = await getCurrentUserId();

	return prisma.location.findMany({
		where: accessibleLocationWhere(userId),
		orderBy: [{ type: 'asc' }, { name: 'asc' }],
	});
}

export async function getOwnedLocation(id: string) {
	const userId = await getCurrentUserId();

	return prisma.location.findFirst({
		where: ownedLocationWhere(userId, { id }),
	});
}

export async function createLocationForCurrentUser(data: LocationInput) {
	const userId = await getCurrentUserId();

	return prisma.location.create({
		data: { ...data, ownerUserId: userId },
	});
}

export async function updateLocationForCurrentUser(id: string, data: LocationInput) {
	const userId = await getCurrentUserId();

	return await prisma.location.updateMany({
		where: ownedLocationWhere(userId, { id }),
		data,
	});
}

export async function archiveLocationForCurrentUser(id: string) {
	const userId = await getCurrentUserId();

	return prisma.location.updateMany({
		where: ownedLocationWhere(userId, { id }),
		data: { deletedAt: new Date() },
	});
}
