import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { BookingStatus, LocationType } from '@/generated/prisma/enums';
import { authenticate } from '@/e2e/helpers/auth';
import {
	createOwnedBooking,
	createOwnedChild,
	createOwnedLocation,
	requireE2EEnvironmentVariable,
} from '@/e2e/helpers/database';
import { shiftDateByDays } from '@/lib/date';
import { bookingFormText } from '@/lib/content/booking-form-text';
import { bookingsText } from '@/lib/content/bookings-text';
import { headerText } from '@/lib/content/header-text';

const ownerEmail = requireE2EEnvironmentVariable('SEED_OWNER_EMAIL');
const secondSessionToken = requireE2EEnvironmentVariable('E2E_SECOND_SESSION_TOKEN');
const {
	fields: {
		childId: childField,
		date: dateField,
		time: timeField,
		pickupLocationId: pickupField,
		activityLocationId: activityField,
		dropoffLocationId: dropoffField,
		estimatedDurationMin: durationField,
		notes: notesField,
	},
	submit,
} = bookingFormText;
const { cancel, status: statusLabels } = bookingsText;

const routes = {
	bookings: '/bookings',
	newBooking: '/bookings/new',
	signIn: '/signin',
} as const;

const notFoundPage = {
	statusCode: '404',
	message: 'This page could not be found.',
};

function uniqueName(prefix: string) {
	return `${prefix}-${randomUUID().slice(0, 8)}`;
}

async function createBookingFixture({
	status = BookingStatus.PENDING,
	scheduledPickupAt = new Date('2090-09-05T20:30:00Z'),
	expiresAt = new Date('2090-09-05T18:30:00Z'),
}: {
	status?: BookingStatus;
	scheduledPickupAt?: Date;
	expiresAt?: Date;
} = {}) {
	const child = {
		firstName: uniqueName('Booking'),
		lastName: 'Rider',
		birthDate: '2015-04-10',
	};
	const pickup = {
		type: LocationType.SCHOOL,
		name: uniqueName('Pickup'),
		addressLine1: '100 School St',
		city: 'Chicago',
		state: 'IL',
		postalCode: '60601',
	};
	const dropoff = {
		...pickup,
		type: LocationType.HOME,
		name: uniqueName('Dropoff'),
		addressLine1: '200 Home St',
	};
	const [childId, pickupLocationId, dropoffLocationId] = await Promise.all([
		createOwnedChild(ownerEmail, child),
		createOwnedLocation(ownerEmail, pickup),
		createOwnedLocation(ownerEmail, dropoff),
	]);
	const bookingId = await createOwnedBooking(ownerEmail, {
		childId,
		pickupLocationId,
		dropoffLocationId,
		status,
		scheduledPickupAt,
		estimatedDurationMin: 45,
		expiresAt,
	});

	return {
		id: bookingId,
		path: `${routes.bookings}/${bookingId}`,
		child,
		fullName: `${child.firstName} ${child.lastName}`,
		pickup,
		dropoff,
	};
}

test('redirects an unauthenticated visitor from bookings to sign in', async ({ context, page }) => {
	await context.clearCookies();
	await page.goto(routes.bookings);
	await expect(page).toHaveURL(routes.signIn);
});

test('shows a booking in the list and opens its details', async ({ page }) => {
	const booking = await createBookingFixture();

	await page.goto(routes.bookings);
	const row = page.getByRole('link', { name: new RegExp(booking.fullName) });
	await expect(row).toContainText(booking.pickup.name);
	await expect(row).toContainText(booking.dropoff.name);
	await expect(row).toContainText(statusLabels.PENDING);
	await expect(row).toContainText('Sep 5, 2090');
	await expect(row).toContainText('3:30 PM');

	await row.click();
	await expect(page).toHaveURL(booking.path);
	await expect(page.getByRole('heading', { name: booking.fullName })).toBeVisible();
	await expect(page.getByText(booking.pickup.name, { exact: true })).toBeVisible();
	await expect(page.getByText(booking.dropoff.name, { exact: true })).toBeVisible();
});

test('creates a booking through the form', async ({ page }) => {
	const child = {
		firstName: uniqueName('Create'),
		lastName: 'Rider',
		birthDate: '2015-04-10',
	};
	const fullName = `${child.firstName} ${child.lastName}`;
	const notes = uniqueName('Meet at the front entrance');
	await createOwnedChild(ownerEmail, child);
	const tomorrow = shiftDateByDays(new Date().toISOString().slice(0, 10), 1);

	await page.goto(routes.newBooking);
	await page.getByLabel(childField.label).selectOption({ label: fullName });
	await page.getByLabel(dateField.label).fill(tomorrow);
	await page.getByLabel(timeField.label).fill('10:30');
	await page.getByLabel(pickupField.label).selectOption({ label: 'Lamar High School' });
	await page.getByLabel(activityField.label, { exact: false }).selectOption({
		label: 'Houston Ballet Academy',
	});
	await page.getByLabel(dropoffField.label).selectOption({ label: "Anna's Home" });
	await page.getByLabel(durationField.label).selectOption('60');
	await page.getByLabel(notesField.label, { exact: false }).fill(notes);
	await page.getByRole('button', { name: submit }).click();

	await expect(page).toHaveURL(routes.bookings);
	const row = page.getByRole('link', { name: new RegExp(fullName) });
	await expect(row).toContainText("Lamar High School → Houston Ballet Academy → Anna's Home");
	await row.click();
	await expect(page.getByText(notes, { exact: true })).toBeVisible();
});

test('displays an expired pending booking as expired', async ({ page }) => {
	const now = Date.now();
	const booking = await createBookingFixture({
		scheduledPickupAt: new Date(now + 60 * 60_000),
		expiresAt: new Date(now - 60_000),
	});

	await page.goto(routes.bookings);
	await expect(page.getByRole('link', { name: new RegExp(booking.fullName) })).toContainText(
		statusLabels.EXPIRED,
	);
});

test('cancels a pending booking from its details', async ({ page }) => {
	const booking = await createBookingFixture();

	await page.goto(booking.path);
	await page.getByRole('button', { name: cancel.trigger }).click();
	const dialog = page.getByRole('alertdialog');
	await expect(dialog.getByRole('heading', { name: cancel.confirm })).toBeVisible();
	await dialog.getByRole('button', { name: cancel.delete }).click();

	await expect(page).toHaveURL(routes.bookings);
	await expect(page.getByRole('link', { name: new RegExp(booking.fullName) })).toContainText(
		statusLabels.CANCELLED,
	);
});

test("does not expose another parent's booking", async ({ baseURL, context, page }) => {
	if (!baseURL) throw new Error('Playwright baseURL is required');
	const booking = await createBookingFixture();
	await authenticate(context, baseURL, secondSessionToken);

	await page.goto(routes.bookings);
	await expect(page.getByText(booking.fullName, { exact: true })).toHaveCount(0);

	await page.goto(booking.path);
	await expect(page.getByRole('heading', { name: notFoundPage.statusCode })).toBeVisible();
	await expect(page.getByRole('heading', { name: notFoundPage.message })).toBeVisible();
});

test('shows the bookings link in parent navigation', async ({ page }) => {
	await page.goto(routes.bookings);
	await expect(
		page.getByRole('banner').getByRole('link', { name: headerText.navigation.bookings }),
	).toHaveAttribute('href', routes.bookings);
});
