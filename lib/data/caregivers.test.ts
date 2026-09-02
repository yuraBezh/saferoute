import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CaregiverStatus, UserRole } from '@/generated/prisma/enums';
import type { CaregiverProfileInput } from '@/lib/validation/caregiver';

const mocks = vi.hoisted(() => ({
	getCurrentUserId: vi.fn(),
	requireRole: vi.fn(),
	findProfile: vi.fn(),
	findUser: vi.fn(),
	updateUser: vi.fn(),
	createProfile: vi.fn(),
	updateProfiles: vi.fn(),
	transaction: vi.fn(),
}));

vi.mock('@/lib/auth/current-user', () => ({ getCurrentUserId: mocks.getCurrentUserId }));
vi.mock('@/lib/auth/roles', () => ({ requireRole: mocks.requireRole }));
vi.mock('@/lib/prisma', () => ({
	prisma: {
		caregiverProfile: {
			findUnique: mocks.findProfile,
			updateMany: mocks.updateProfiles,
		},
		$transaction: mocks.transaction,
	},
}));

import {
	createCaregiverProfileForCurrentUser,
	getCaregiverProfileForCurrentUser,
	updateCaregiverProfileForCurrentUser,
} from './caregivers';

const currentUserFixture = { id: 'user-1' };
const inputFixture: CaregiverProfileInput = {
	bio: 'Experienced caregiver',
	hourlyRate: '25.50',
	vehicleMake: 'Honda',
	vehicleModel: 'Odyssey',
	vehicleYear: 2022,
	vehicleColor: 'Blue',
	licensePlate: 'SAFE-123',
};
const profileDataFixture = {
	bio: inputFixture.bio,
	hourlyRateCents: 2550,
	vehicleMake: inputFixture.vehicleMake,
	vehicleModel: inputFixture.vehicleModel,
	vehicleYear: inputFixture.vehicleYear,
	vehicleColor: inputFixture.vehicleColor,
	licensePlate: inputFixture.licensePlate,
};

describe('caregiver data access', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.requireRole.mockReset();
		mocks.getCurrentUserId.mockResolvedValue(currentUserFixture.id);
		mocks.transaction.mockImplementation((operation) =>
			operation({
				user: {
					findUniqueOrThrow: mocks.findUser,
					update: mocks.updateUser,
				},
				caregiverProfile: { create: mocks.createProfile },
			}),
		);
	});

	it('loads the current user profile with newest verification documents first', async () => {
		const profileFixture = { id: 'profile-1' };
		mocks.findProfile.mockResolvedValue(profileFixture);

		await expect(getCaregiverProfileForCurrentUser()).resolves.toBe(profileFixture);
		expect(mocks.findProfile).toHaveBeenCalledWith({
			where: { userId: currentUserFixture.id },
			include: {
				verificationDocuments: {
					orderBy: { createdAt: 'desc' },
					include: { reviewedBy: { select: { fullName: true } } },
				},
			},
		});
	});

	it('creates a pending profile and caregiver role within a transaction', async () => {
		mocks.findUser.mockResolvedValue({ roles: [UserRole.PARENT] });
		mocks.createProfile.mockResolvedValue({ id: 'profile-1' });

		await createCaregiverProfileForCurrentUser(inputFixture);

		expect(mocks.transaction).toHaveBeenCalledOnce();
		expect(mocks.updateUser).toHaveBeenCalledWith({
			where: { id: currentUserFixture.id },
			data: { roles: [UserRole.PARENT, UserRole.CAREGIVER] },
		});
		expect(mocks.createProfile).toHaveBeenCalledWith({
			data: {
				...profileDataFixture,
				userId: currentUserFixture.id,
				status: CaregiverStatus.PENDING_VERIFICATION,
			},
		});
	});

	it('does not duplicate an existing caregiver role', async () => {
		mocks.findUser.mockResolvedValue({ roles: [UserRole.CAREGIVER] });

		await createCaregiverProfileForCurrentUser(inputFixture);

		expect(mocks.updateUser).toHaveBeenCalledWith({
			where: { id: currentUserFixture.id },
			data: { roles: [UserRole.CAREGIVER] },
		});
	});

	it('updates only a non-suspended profile for an authorized caregiver', async () => {
		const resultFixture = { count: 1 };
		mocks.updateProfiles.mockResolvedValue(resultFixture);

		await expect(updateCaregiverProfileForCurrentUser(inputFixture)).resolves.toBe(resultFixture);
		expect(mocks.requireRole).toHaveBeenCalledWith(UserRole.CAREGIVER);
		expect(mocks.updateProfiles).toHaveBeenCalledWith({
			where: {
				userId: currentUserFixture.id,
				status: { not: CaregiverStatus.SUSPENDED },
			},
			data: profileDataFixture,
		});
	});

	it('does not update a profile when caregiver authorization fails', async () => {
		mocks.requireRole.mockRejectedValue(new Error('Forbidden'));

		await expect(updateCaregiverProfileForCurrentUser(inputFixture)).rejects.toThrow('Forbidden');
		expect(mocks.updateProfiles).not.toHaveBeenCalled();
	});

	it('reports that a suspended profile was not updated', async () => {
		const resultFixture = { count: 0 };
		mocks.updateProfiles.mockResolvedValue(resultFixture);

		await expect(updateCaregiverProfileForCurrentUser(inputFixture)).resolves.toBe(resultFixture);
	});
});
