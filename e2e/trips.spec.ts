import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { BookingStatus, LocationType, TripStatus } from '@/generated/prisma/enums';
import { authenticate } from '@/e2e/helpers/auth';
import {
	createOwnedBooking,
	createOwnedChild,
	createOwnedLocation,
	requireE2EEnvironmentVariable,
} from '@/e2e/helpers/database';
import { assignmentsText } from '@/lib/content/assignments-text';
import { tripText } from '@/lib/content/trip-text';

const ownerEmail = requireE2EEnvironmentVariable('SEED_OWNER_EMAIL');
const caregiverSessionToken = requireE2EEnvironmentVariable('E2E_DUAL_ROLE_SESSION_TOKEN');
const { acceptLabel } = assignmentsText;
const { actionLabels, openTrip, pinLabel, statusLabels } = tripText;

async function createPendingBooking(scheduledPickupAt: string) {
	const suffix = randomUUID().slice(0, 8);
	const childId = await createOwnedChild(ownerEmail, {
		firstName: `Trip-${suffix}`,
		lastName: 'Rider',
		birthDate: '2015-04-10',
	});
	const pickupLocationId = await createOwnedLocation(ownerEmail, {
		type: LocationType.SCHOOL,
		name: `Trip School ${suffix}`,
		addressLine1: '100 School St',
		city: 'Chicago',
		state: 'IL',
		postalCode: '60601',
	});
	const dropoffLocationId = await createOwnedLocation(ownerEmail, {
		type: LocationType.HOME,
		name: `Trip Home ${suffix}`,
		addressLine1: '200 Home St',
		city: 'Chicago',
		state: 'IL',
		postalCode: '60601',
	});

	const bookingId = await createOwnedBooking(ownerEmail, {
		childId,
		pickupLocationId,
		dropoffLocationId,
		status: BookingStatus.PENDING,
		scheduledPickupAt: new Date(scheduledPickupAt),
		estimatedDurationMin: 45,
		expiresAt: new Date(new Date(scheduledPickupAt).getTime() - 2 * 60 * 60 * 1000),
	});

	return { bookingId, childName: `Trip-${suffix}` };
}

test('accepting a booking creates a trip visible to the caregiver and parent', async ({
	baseURL,
	context,
	page,
	browser,
}) => {
	if (!baseURL) throw new Error('Playwright baseURL is required');
	const booking = await createPendingBooking('2090-09-05T20:30:00Z');
	await authenticate(context, baseURL, caregiverSessionToken);

	await page.goto('/caregiver/assignments');
	const availableCard = page.locator('li').filter({ hasText: booking.childName });
	await availableCard.getByRole('button', { name: acceptLabel }).click();

	const acceptedCard = page.locator('li').filter({ hasText: booking.childName });
	await expect(acceptedCard.getByRole('link', { name: openTrip })).toBeVisible();
	await acceptedCard.getByRole('link', { name: openTrip }).click();
	await expect(page).toHaveURL(/\/trips\/[^/]+$/);

	const parentContext = await browser.newContext();
	const parentPage = await parentContext.newPage();
	await authenticate(parentContext, baseURL, requireE2EEnvironmentVariable('E2E_SESSION_TOKEN'));
	await parentPage.goto(`/bookings/${booking.bookingId}`);
	await expect(parentPage.getByText(pinLabel)).toBeVisible();
	await expect(parentPage.locator('dd').filter({ hasText: /^\d{6}$/ })).toHaveText(/\d{6}/);
	await parentContext.close();
});

test('caregiver pickup PIN validation changes the trip status only for the correct PIN', async ({
	baseURL,
	context,
	page,
}) => {
	if (!baseURL) throw new Error('Playwright baseURL is required');
	const booking = await createPendingBooking('2090-09-06T20:30:00Z');
	await authenticate(context, baseURL, caregiverSessionToken);

	await page.goto('/caregiver/assignments');
	const availableCard = page.locator('li').filter({ hasText: booking.childName });
	await availableCard.getByRole('button', { name: acceptLabel }).click();
	const acceptedCard = page.locator('li').filter({ hasText: booking.childName });
	await acceptedCard.getByRole('link', { name: openTrip }).click();

	await page.getByRole('button', { name: actionLabels.EN_ROUTE_TO_SCHOOL }).click();
	await expect(page.getByText(statusLabels.EN_ROUTE_TO_SCHOOL)).toBeVisible();

	const pinInput = page.getByLabel(pinLabel);
	await pinInput.fill('000000');
	await page.getByRole('button', { name: actionLabels.CHILD_PICKED_UP }).click();
	await expect(page.getByText(statusLabels.EN_ROUTE_TO_SCHOOL)).toBeVisible();

	const parentContext = await page.context().browser()!.newContext();
	const parentPage = await parentContext.newPage();
	await authenticate(parentContext, baseURL, requireE2EEnvironmentVariable('E2E_SESSION_TOKEN'));
	await parentPage.goto(`/bookings/${booking.bookingId}`);
	const pickupPin = await parentPage
		.locator('dd')
		.filter({ hasText: /^\d{6}$/ })
		.textContent();
	if (!pickupPin) throw new Error('Parent pickup PIN was not rendered');

	await pinInput.fill(pickupPin);
	await page.getByRole('button', { name: actionLabels.CHILD_PICKED_UP }).click();
	await expect(page.getByText(statusLabels[TripStatus.CHILD_PICKED_UP])).toBeVisible();
	await parentContext.close();
});
