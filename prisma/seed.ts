import 'dotenv/config';
import { prisma } from '@/lib/prisma';
import { GuardianRelationship } from '@/app/generated/prisma/enums';

async function main() {
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

	const john = await prisma.child.create({
		data: {
			firstName: 'John',
			lastName: 'Krasinski',
			birthDate: new Date('2010-01-01'),
		},
	});

	const bobby = await prisma.child.create({
		data: {
			firstName: 'Bobby',
			lastName: 'White',
			birthDate: new Date('2004-12-31'),
		},
	});

	const nick = await prisma.child.create({
		data: {
			firstName: 'Nick',
			lastName: 'Johnson',
			birthDate: new Date('2006-03-17'),
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
