import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import {
	BookingStatus,
	CaregiverStatus,
	GuardianRelationship,
	LocationType,
	UserRole,
	VerificationDocumentStatus,
	VerificationDocumentType,
} from '@/generated/prisma/enums';
import { fromUtc, shiftDateByDays, toDbDate, toUtc } from '@/lib/date';
import { getBookingExpiresAt } from '@/lib/bookings/time';

async function createE2ESession(userId: string, environmentVariable: string) {
	const sessionToken = process.env[environmentVariable];

	if (!sessionToken) return;

	await prisma.session.create({
		data: {
			userId,
			sessionToken,
			expires: new Date(Date.now() + 60 * 60 * 1000),
		},
	});
}

async function main() {
	await prisma.$transaction([
		prisma.booking.deleteMany(),
		prisma.verificationDocument.deleteMany(),
		prisma.caregiverProfile.deleteMany(),
		prisma.session.deleteMany(),
		prisma.account.deleteMany(),
		prisma.location.deleteMany(),
		prisma.childGuardian.deleteMany(),
		prisma.child.deleteMany(),
		prisma.user.deleteMany(),
		prisma.verificationToken.deleteMany(),
	]);

	const ownerEmail = process.env.SEED_OWNER_EMAIL ?? 'mother@example.com';
	const mother = await prisma.user.create({
		data: {
			email: ownerEmail,
			fullName: 'Anna Krasinski',
		},
	});
	await createE2ESession(mother.id, 'E2E_SESSION_TOKEN');

	const father = await prisma.user.create({
		data: {
			email: 'father@example.com',
			fullName: 'Devid Krasinski',
		},
	});
	await createE2ESession(father.id, 'E2E_SECOND_SESSION_TOKEN');

	const onboardingUser = await prisma.user.create({
		data: {
			email: 'caregiver-onboarding@example.com',
			fullName: 'Taylor Brooks',
		},
	});
	await createE2ESession(onboardingUser.id, 'E2E_ONBOARDING_SESSION_TOKEN');

	const admin = await prisma.user.create({
		data: {
			email: 'admin@example.com',
			fullName: 'Alex Morgan',
			roles: [UserRole.ADMIN],
		},
	});

	const maria = await prisma.user.create({
		data: {
			email: 'caregiver@example.com',
			fullName: 'Maria Garcia',
			roles: [UserRole.CAREGIVER],
			caregiverProfile: {
				create: {
					bio: 'Experienced caregiver and safe driver.',
					hourlyRateCents: 2800,
					vehicleMake: 'Toyota',
					vehicleModel: 'Sienna',
					vehicleYear: 2022,
					vehicleColor: 'Silver',
					licensePlate: 'SR-CARE',
					status: CaregiverStatus.VERIFIED,
					verificationDocuments: {
						create: [
							{
								type: VerificationDocumentType.DRIVERS_LICENSE,
								storageKey: 'caregivers/maria/drivers-license.pdf',
								status: VerificationDocumentStatus.APPROVED,
								reviewedBy: { connect: { id: admin.id } },
								reviewedAt: new Date('2026-08-15T14:00:00.000Z'),
								expiresAt: new Date('2029-05-31T23:59:59.999Z'),
							},
							{
								type: VerificationDocumentType.INSURANCE,
								storageKey: 'caregivers/maria/insurance.pdf',
								status: VerificationDocumentStatus.APPROVED,
								reviewedBy: { connect: { id: admin.id } },
								reviewedAt: new Date('2026-08-16T14:00:00.000Z'),
								expiresAt: new Date('2027-08-31T23:59:59.999Z'),
							},
						],
					},
				},
			},
		},
	});
	const suspendedCaregiver = await prisma.user.create({
		data: {
			email: 'suspended-caregiver@example.com',
			fullName: 'Sam Rivera',
			roles: [UserRole.CAREGIVER],
			caregiverProfile: {
				create: {
					hourlyRateCents: 2600,
					status: CaregiverStatus.SUSPENDED,
				},
			},
		},
	});
	await createE2ESession(suspendedCaregiver.id, 'E2E_SUSPENDED_CAREGIVER_SESSION_TOKEN');

	const dualRoleUser = await prisma.user.create({
		data: {
			email: 'parent-caregiver@example.com',
			fullName: 'Jordan Lee',
			roles: [UserRole.PARENT, UserRole.CAREGIVER],
			caregiverProfile: {
				create: {
					bio: 'Parent and part-time caregiver.',
					hourlyRateCents: 2400,
					vehicleMake: 'Honda',
					vehicleModel: 'Odyssey',
					vehicleYear: 2021,
					vehicleColor: 'Blue',
					licensePlate: 'SR-DUAL',
					status: CaregiverStatus.VERIFIED,
				},
			},
		},
	});
	await createE2ESession(dualRoleUser.id, 'E2E_DUAL_ROLE_SESSION_TOKEN');

	const [school, motherHome, , activity] = await prisma.$transaction([
		prisma.location.create({
			data: {
				type: LocationType.SCHOOL,
				name: 'Lamar High School',
				addressLine1: '3325 Westheimer Rd',
				city: 'Houston',
				state: 'TX',
				postalCode: '77098',
				ownerUserId: null,
				isVerified: true,
			},
		}),
		prisma.location.create({
			data: {
				type: LocationType.HOME,
				name: "Anna's Home",
				addressLine1: '1515 Austin St',
				city: 'Houston',
				state: 'TX',
				postalCode: '77002',
				ownerUserId: mother.id,
			},
		}),
		prisma.location.create({
			data: {
				type: LocationType.HOME,
				name: "Devid's Home",
				addressLine1: '404 Oxford St',
				city: 'Houston',
				state: 'TX',
				postalCode: '77007',
				ownerUserId: father.id,
			},
		}),
		prisma.location.create({
			data: {
				type: LocationType.ACTIVITY,
				name: 'Houston Ballet Academy',
				addressLine1: '601 Preston St',
				city: 'Houston',
				state: 'TX',
				postalCode: '77002',
				ownerUserId: null,
				isVerified: true,
			},
		}),
	]);

	const john = await prisma.child.create({
		data: {
			firstName: 'John',
			lastName: 'Krasinski',
			birthDate: toDbDate('2010-01-01'),
		},
	});

	const bobby = await prisma.child.create({
		data: {
			firstName: 'Bobby',
			lastName: 'White',
			birthDate: toDbDate('2012-12-31'),
		},
	});

	const nick = await prisma.child.create({
		data: {
			firstName: 'Nick',
			lastName: 'Johnson',
			birthDate: toDbDate('2009-03-17'),
		},
	});

	await prisma.childGuardian.createMany({
		data: [
			// John has two parents
			{
				childId: john.id,
				userId: mother.id,
				relationship: GuardianRelationship.MOTHER,
				isPrimary: true,
				canBook: true,
				canApproveHandoff: true,
			},
			{
				childId: john.id,
				userId: father.id,
				relationship: GuardianRelationship.FATHER,
				isPrimary: false,
				canBook: false,
				canApproveHandoff: true,
			},
			// Bobby has only mother
			{
				childId: bobby.id,
				userId: mother.id,
				relationship: GuardianRelationship.MOTHER,
				isPrimary: true,
				canBook: true,
				canApproveHandoff: true,
			},
			// Nick has only father
			{
				childId: nick.id,
				userId: father.id,
				relationship: GuardianRelationship.FATHER,
				isPrimary: true,
				canBook: true,
				canApproveHandoff: true,
			},
		],
	});

	const todayAtPickupLocation = fromUtc(new Date(), school.timezone).date;
	const bookingTimes = [
		toUtc(shiftDateByDays(todayAtPickupLocation, 1), '15:30', school.timezone),
		toUtc(shiftDateByDays(todayAtPickupLocation, 2), '14:30', school.timezone),
		toUtc(shiftDateByDays(todayAtPickupLocation, 3), '16:00', school.timezone),
	];
	const [pendingPickupAt, acceptedPickupAt, declinedPickupAt] = bookingTimes;

	await prisma.booking.createMany({
		data: [
			{
				childId: john.id,
				requestedByUserId: mother.id,
				status: BookingStatus.PENDING,
				scheduledPickupAt: pendingPickupAt,
				pickupLocationId: school.id,
				activityLocationId: activity.id,
				dropoffLocationId: motherHome.id,
				estimatedDurationMin: 90,
				notes: 'Pickup at the main entrance.',
				expiresAt: getBookingExpiresAt(pendingPickupAt),
			},
			{
				childId: bobby.id,
				requestedByUserId: mother.id,
				caregiverUserId: maria.id,
				status: BookingStatus.ACCEPTED,
				scheduledPickupAt: acceptedPickupAt,
				pickupLocationId: school.id,
				dropoffLocationId: motherHome.id,
				estimatedDurationMin: 45,
				expiresAt: getBookingExpiresAt(acceptedPickupAt),
			},
			{
				childId: john.id,
				requestedByUserId: mother.id,
				caregiverUserId: maria.id,
				status: BookingStatus.DECLINED,
				scheduledPickupAt: declinedPickupAt,
				pickupLocationId: school.id,
				activityLocationId: activity.id,
				dropoffLocationId: motherHome.id,
				estimatedDurationMin: 75,
				expiresAt: getBookingExpiresAt(declinedPickupAt),
			},
		],
	});
}

main()
	.then(() => prisma.$disconnect())
	.catch(async (error) => {
		console.error(error);
		await prisma.$disconnect();
		process.exit(1);
	});
