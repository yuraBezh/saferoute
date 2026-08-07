import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
	await prisma.child.deleteMany();

	await prisma.child.createMany({
		data: [
			{ firstName: "John", lastName: "Krasinski", birthDate: new Date(2010, 0, 1) },
			{ firstName: "Bobby", lastName: "White", birthDate: new Date(2004, 12, 31) },
		],
	});
}

main();
