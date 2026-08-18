import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import { GuardianRelationship, LocationType } from '@/generated/prisma/enums';
import { toDbDate } from '@/lib/date';

async function main() {
	await prisma.location.deleteMany();
	await prisma.childGuardian.deleteMany();
	await prisma.child.deleteMany();
	await prisma.user.deleteMany();

	const mother = await prisma.user.create({
		data: {
			email: 'mother@example.com',
			fullName: 'Anna Krasinski',
			passwordHash: null,
		},
	});

	const father = await prisma.user.create({
		data: {
			email: 'father@example.com',
			fullName: 'Devid Krasinski',
			passwordHash: null,
		},
	});

	await prisma.location.createMany({
		data: [
			{
				type: LocationType.SCHOOL,
				name: 'Lamar High School',
				addressLine1: '3325 Westheimer Rd',
				city: 'Houston',
				state: 'TX',
				postalCode: '77098',
				ownerUserId: null,
				isVerified: true,
			},
			{
				type: LocationType.HOME,
				name: "Anna's Home",
				addressLine1: '1515 Austin St',
				city: 'Houston',
				state: 'TX',
				postalCode: '77002',
				ownerUserId: mother.id,
			},
			{
				type: LocationType.HOME,
				name: "Devid's Home",
				addressLine1: '404 Oxford St',
				city: 'Houston',
				state: 'TX',
				postalCode: '77007',
				ownerUserId: father.id,
			},
			{
				type: LocationType.ACTIVITY,
				name: 'Houston Ballet Academy',
				addressLine1: '601 Preston St',
				city: 'Houston',
				state: 'TX',
				postalCode: '77002',
				ownerUserId: null,
				isVerified: true,
			},
		],
	});

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
			birthDate: toDbDate('2010-01-01'),
		},
	});

	const nick = await prisma.child.create({
		data: {
			firstName: 'Nick',
			lastName: 'Johnson',
			birthDate: toDbDate('2010-01-01'),
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
}

main()
	.then(() => prisma.$disconnect())
	.catch(async (error) => {
		console.error(error);
		await prisma.$disconnect();
		process.exit(1);
	});
