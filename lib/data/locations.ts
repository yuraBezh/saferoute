import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth/current-user';
import { LocationInput } from '@/lib/validation/location';

export async function getLocationsForCurrentUser() {
	const userId = await getCurrentUserId();

	return prisma.location.findMany({
		where: {
			OR: [{ ownerUserId: userId }, { ownerUserId: null }],
		},
		orderBy: [{ type: 'asc' }, { name: 'asc' }],
	});
}

export async function getOwnedLocation(id: string) {
	const userId = await getCurrentUserId();

	return prisma.location.findFirst({
		where: { id, ownerUserId: userId },
	});
}

export async function requireOwnedLocation(id: string) {
	const location = await getOwnedLocation(id);

	if (!location) {
		throw new Error('Location not found or access denied');
	}

	return location;
}

export async function createLocationForCurrentUser(data: LocationInput) {
	const userId = await getCurrentUserId();

	return prisma.location.create({
		data: { ...data, ownerUserId: userId },
	});
}

export async function updateLocationForCurrentUser(
	id: string,
	data: LocationInput,
) {
	const userId = await getCurrentUserId();

	return await prisma.location.updateMany({
		where: { id, ownerUserId: userId },
		data,
	});
}

export async function deleteLocationForCurrentUser(id: string) {
	const userId = await getCurrentUserId();

	await requireOwnedLocation(id);

	return prisma.location.deleteMany({
		where: { id, ownerUserId: userId },
	});
}
