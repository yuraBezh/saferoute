import { cache } from 'react';
import { CaregiverStatus, UserRole } from '@/generated/prisma/enums';
import { getCurrentUserId } from '@/lib/auth/current-user';
import { requireRole } from '@/lib/auth/roles';
import { CAREGIVER_ERRORS } from '@/lib/caregiver/errors';
import { toCents } from '@/lib/money';
import { prisma } from '@/lib/prisma';
import type { CaregiverProfileInput } from '@/lib/validation/caregiver';

const toProfileData = (data: CaregiverProfileInput) => ({
	bio: data.bio,
	hourlyRateCents: toCents(data.hourlyRate),
	vehicleMake: data.vehicleMake,
	vehicleModel: data.vehicleModel,
	vehicleYear: data.vehicleYear,
	vehicleColor: data.vehicleColor,
	licensePlate: data.licensePlate,
});

export const getCaregiverProfileForCurrentUser = cache(async () => {
	const userId = await getCurrentUserId();
	return prisma.caregiverProfile.findUnique({
		where: { userId },
		include: {
			verificationDocuments: {
				orderBy: { createdAt: 'desc' },
				include: { reviewedBy: { select: { fullName: true } } },
			},
		},
	});
});

export const getCaregiverStatus = cache(async () => {
	const userId = await getCurrentUserId();
	const profile = await prisma.caregiverProfile.findUnique({
		where: { userId },
		select: { status: true },
	});

	return profile?.status ?? null;
});

export async function createCaregiverProfileForCurrentUser(data: CaregiverProfileInput) {
	const userId = await getCurrentUserId();
	const profileData = toProfileData(data);

	return prisma.$transaction(async (tx) => {
		const user = await tx.user.findUniqueOrThrow({
			where: { id: userId },
			select: { roles: true },
		});

		const roles = user.roles.includes(UserRole.CAREGIVER)
			? user.roles
			: [...user.roles, UserRole.CAREGIVER];

		await tx.user.update({ where: { id: userId }, data: { roles } });

		return tx.caregiverProfile.create({
			data: {
				...profileData,
				userId,
				status: CaregiverStatus.PENDING_VERIFICATION,
			},
		});
	});
}

export async function updateCaregiverProfileForCurrentUser(data: CaregiverProfileInput) {
	await requireRole(UserRole.CAREGIVER);
	const userId = await getCurrentUserId();
	return prisma.caregiverProfile.updateMany({
		where: { userId, status: { not: CaregiverStatus.SUSPENDED } },
		data: toProfileData(data),
	});
}

export async function selfVerifyCaregiverProfile() {
	const userId = await getCurrentUserId();

	const result = await prisma.caregiverProfile.updateMany({
		where: { userId, status: CaregiverStatus.PENDING_VERIFICATION },
		data: { status: CaregiverStatus.VERIFIED },
	});

	if (result.count === 0) throw new Error(CAREGIVER_ERRORS.cannotSelfVerify);
}
