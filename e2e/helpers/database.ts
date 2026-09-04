import { randomUUID } from 'node:crypto';
import { Client } from 'pg';
import type { BookingStatus, LocationType } from '@/generated/prisma/enums';

type ChildFixture = {
	firstName: string;
	lastName: string;
	birthDate: string;
};

type LocationFixture = {
	type: LocationType;
	name: string;
	addressLine1: string;
	addressLine2?: string;
	city: string;
	state: string;
	postalCode: string;
};

type BookingFixture = {
	childId: string;
	pickupLocationId: string;
	activityLocationId?: string;
	dropoffLocationId: string;
	status: BookingStatus;
	scheduledPickupAt: Date;
	estimatedDurationMin: number;
	expiresAt: Date;
	notes?: string;
};

const createFixtureId = () => `e2e_${randomUUID().replaceAll('-', '').slice(0, 21)}`;

export function requireE2EEnvironmentVariable(name: string) {
	const value = process.env[name];

	if (!value) {
		throw new Error('Run Playwright through npm run test:e2e');
	}

	return value;
}

function getE2EDatabaseUrl() {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error('DATABASE_URL is required in .env.e2e');
	}

	const url = new URL(databaseUrl);
	const isE2EDatabase =
		process.env.ALLOW_DATABASE_RESET === 'true' &&
		['127.0.0.1', 'localhost'].includes(url.hostname) &&
		url.port === '5433' &&
		url.pathname === '/saferoute_e2e';

	if (!isE2EDatabase) {
		throw new Error('Refusing to prepare fixtures outside the E2E database');
	}

	return databaseUrl;
}

async function getOwnerId(client: Client, ownerEmail: string) {
	const result = await client.query<{ id: string }>('SELECT "id" FROM "User" WHERE "email" = $1', [
		ownerEmail,
	]);

	if (result.rowCount !== 1) {
		throw new Error(`E2E owner not found: ${ownerEmail}`);
	}

	return result.rows[0].id;
}

export async function createOwnedChild(ownerEmail: string, child: ChildFixture) {
	const client = new Client({ connectionString: getE2EDatabaseUrl() });
	const childId = createFixtureId();

	await client.connect();

	try {
		await client.query('BEGIN');
		const ownerId = await getOwnerId(client, ownerEmail);

		await client.query(
			`INSERT INTO "Child"
				("id", "firstName", "lastName", "birthDate", "updatedAt")
			VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
			[childId, child.firstName, child.lastName, child.birthDate],
		);
		await client.query(
			`INSERT INTO "ChildGuardian"
				("id", "childId", "userId", "relationship", "isPrimary")
			VALUES ($1, $2, $3, 'GUARDIAN', true)`,
			[createFixtureId(), childId, ownerId],
		);

		await client.query('COMMIT');
		return childId;
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		await client.end();
	}
}

export async function createOwnedLocation(ownerEmail: string, location: LocationFixture) {
	const client = new Client({ connectionString: getE2EDatabaseUrl() });
	const locationId = createFixtureId();

	await client.connect();

	try {
		const ownerId = await getOwnerId(client, ownerEmail);

		await client.query(
			`INSERT INTO "Location"
				("id", "type", "name", "addressLine1", "addressLine2", "city", "state", "postalCode", "ownerUserId", "updatedAt")
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)`,
			[
				locationId,
				location.type,
				location.name,
				location.addressLine1,
				location.addressLine2 ?? null,
				location.city,
				location.state,
				location.postalCode,
				ownerId,
			],
		);

		return locationId;
	} finally {
		await client.end();
	}
}

export async function createOwnedBooking(ownerEmail: string, booking: BookingFixture) {
	const client = new Client({ connectionString: getE2EDatabaseUrl() });
	const bookingId = createFixtureId();

	await client.connect();

	try {
		const ownerId = await getOwnerId(client, ownerEmail);

		await client.query(
			`INSERT INTO "Booking"
				("id", "childId", "requestedByUserId", "status", "scheduledPickupAt",
				 "pickupLocationId", "activityLocationId", "dropoffLocationId",
				 "estimatedDurationMin", "notes", "expiresAt", "updatedAt")
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)`,
			[
				bookingId,
				booking.childId,
				ownerId,
				booking.status,
				booking.scheduledPickupAt,
				booking.pickupLocationId,
				booking.activityLocationId ?? null,
				booking.dropoffLocationId,
				booking.estimatedDurationMin,
				booking.notes ?? null,
				booking.expiresAt,
			],
		);

		return bookingId;
	} finally {
		await client.end();
	}
}
