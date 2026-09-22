import { randomUUID } from 'node:crypto';
import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test';
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
const parentSessionToken = requireE2EEnvironmentVariable('E2E_SESSION_TOKEN');
const unrelatedUserSessionToken = requireE2EEnvironmentVariable('E2E_SECOND_SESSION_TOKEN');
const { acceptLabel } = assignmentsText;
const {
	actionLabels: {
		AT_ACTIVITY: arriveAtActivityAction,
		CANCELLED: cancelTripAction,
		CHILD_PICKED_UP: confirmPickupActionLabel,
		COMPLETED: completeTripAction,
		EN_ROUTE_HOME: headHomeAction,
		EN_ROUTE_TO_SCHOOL: startTripAction,
	},
	eventLog,
	eventPickupConfirmed,
	eventUpdated,
	invalidPinError,
	invalidTransitionError,
	openTrip,
	pinLabel,
	skipActivityAction,
	statusLabels: {
		AT_ACTIVITY: atActivityStatus,
		CANCELLED: cancelledStatus,
		CHILD_PICKED_UP: childPickedUpStatus,
		COMPLETED: completedStatus,
		EN_ROUTE_HOME: enRouteHomeStatus,
		EN_ROUTE_TO_SCHOOL: enRouteToSchoolStatus,
	},
	statusLabels,
	tripCompleteMessage,
} = tripText;

type TripTestContext = {
	context: BrowserContext;
	page: Page;
	browser: Browser;
	baseURL: string;
};

async function createPendingBooking(scheduledPickupAt: string, withActivity = false) {
	const suffix = randomUUID().slice(0, 8);
	const childName = `Trip-${suffix}`;
	const [childId, pickupLocationId, dropoffLocationId, activityLocationId] = await Promise.all([
		createOwnedChild(ownerEmail, {
			firstName: childName,
			lastName: 'Rider',
			birthDate: '2015-04-10',
		}),
		createOwnedLocation(ownerEmail, {
			type: LocationType.SCHOOL,
			name: `Trip School ${suffix}`,
			addressLine1: '100 School St',
			city: 'Chicago',
			state: 'IL',
			postalCode: '60601',
		}),
		createOwnedLocation(ownerEmail, {
			type: LocationType.HOME,
			name: `Trip Home ${suffix}`,
			addressLine1: '200 Home St',
			city: 'Chicago',
			state: 'IL',
			postalCode: '60601',
		}),
		withActivity
			? createOwnedLocation(ownerEmail, {
					type: LocationType.ACTIVITY,
					name: `Trip Activity ${suffix}`,
					addressLine1: '150 Activity Ave',
					city: 'Chicago',
					state: 'IL',
					postalCode: '60601',
				})
			: Promise.resolve(undefined),
	]);

	const bookingId = await createOwnedBooking(ownerEmail, {
		childId,
		pickupLocationId,
		activityLocationId,
		dropoffLocationId,
		status: BookingStatus.PENDING,
		scheduledPickupAt: new Date(scheduledPickupAt),
		estimatedDurationMin: 45,
		expiresAt: new Date(new Date(scheduledPickupAt).getTime() - 2 * 60 * 60 * 1000),
	});

	return { bookingId, childName };
}

function requireBaseURL(baseURL: string | undefined): string {
	if (!baseURL) throw new Error('Playwright baseURL is required');
	return baseURL;
}

async function openAcceptedTrip(
	context: BrowserContext,
	page: Page,
	baseURL: string,
	booking: Awaited<ReturnType<typeof createPendingBooking>>,
) {
	await authenticate(context, baseURL, caregiverSessionToken);
	await page.goto('/caregiver/assignments');
	const availableCard = page.locator('li').filter({ hasText: booking.childName });
	await availableCard.getByRole('button', { name: acceptLabel }).click();

	const acceptedCard = page.locator('li').filter({ hasText: booking.childName });
	await acceptedCard.getByRole('link', { name: openTrip }).click();
	await expect(page).toHaveURL(/\/trips\/[^/]+$/);
	return page.url();
}

async function openParentBooking(browser: Browser, baseURL: string, bookingId: string) {
	const context = await browser.newContext();
	const page = await context.newPage();
	await authenticate(context, baseURL, parentSessionToken);
	await page.goto(`/bookings/${bookingId}`);
	return { context, page };
}

async function withParentBooking(
	browser: Browser,
	baseURL: string,
	bookingId: string,
	assertions: (page: Page) => Promise<void>,
) {
	const { context, page } = await openParentBooking(browser, baseURL, bookingId);

	try {
		await assertions(page);
	} finally {
		await context.close();
	}
}

async function readPickupPin(browser: Browser, baseURL: string, bookingId: string) {
	let pickupPin: string | null = null;

	await withParentBooking(browser, baseURL, bookingId, async (page) => {
		pickupPin = await page
			.locator('dd')
			.filter({ hasText: /^\d{6}$/ })
			.textContent();
	});

	if (!pickupPin) throw new Error('Parent pickup PIN was not rendered');
	return pickupPin;
}

async function startTrip(page: Page) {
	await page.getByRole('button', { name: startTripAction }).click();
	await expect(page.getByText(enRouteToSchoolStatus)).toBeVisible();
}

async function confirmPickup(page: Page, pickupPin: string) {
	await page.getByLabel(pinLabel).fill(pickupPin);
	await page.getByRole('button', { name: confirmPickupActionLabel }).click();
	await expect(page.getByText(childPickedUpStatus)).toBeVisible();
}

async function openPickedUpTrip({
	context,
	page,
	browser,
	baseURL,
	scheduledPickupAt,
	withActivity = false,
}: TripTestContext & { scheduledPickupAt: string; withActivity?: boolean }) {
	const booking = await createPendingBooking(scheduledPickupAt, withActivity);
	await openAcceptedTrip(context, page, baseURL, booking);
	await startTrip(page);
	await confirmPickup(page, await readPickupPin(browser, baseURL, booking.bookingId));
	return booking;
}

async function finishTrip(page: Page) {
	await page.getByRole('button', { name: completeTripAction }).click();
	await expect(page.getByText(completedStatus, { exact: true })).toBeVisible();
}

async function goHomeAndFinishTrip(page: Page) {
	await page.getByRole('button', { name: headHomeAction }).click();
	await expect(page.getByText(enRouteHomeStatus)).toBeVisible();
	await finishTrip(page);
}

const eventTransition = (from: TripStatus, to: TripStatus) =>
	`${statusLabels[from]} → ${statusLabels[to]}`;

const pickedUpEventHistory = [
	eventUpdated,
	eventTransition(TripStatus.SCHEDULED, TripStatus.EN_ROUTE_TO_SCHOOL),
	eventPickupConfirmed,
] as const;

async function expectParentEventHistory(
	browser: Browser,
	baseURL: string,
	bookingId: string,
	expectedEvents: readonly string[],
) {
	await withParentBooking(browser, baseURL, bookingId, async (page) => {
		const eventActions = page
			.getByRole('heading', { name: eventLog })
			.locator('xpath=following-sibling::div[1]/div/span[1]');
		await expect(eventActions).toHaveText(expectedEvents);
	});
}

const makeDifferentPin = (pickupPin: string) =>
	`${pickupPin[0] === '0' ? '1' : '0'}${pickupPin.slice(1)}`;

test('accepting a booking creates a trip visible to the caregiver and parent', async ({
	baseURL,
	context,
	page,
	browser,
}) => {
	baseURL = requireBaseURL(baseURL);
	const booking = await createPendingBooking('2090-09-05T20:30:00Z');
	await openAcceptedTrip(context, page, baseURL, booking);

	await withParentBooking(browser, baseURL, booking.bookingId, async (parentPage) => {
		await expect(parentPage.getByText(pinLabel)).toBeVisible();
		await expect(parentPage.locator('dd').filter({ hasText: /^\d{6}$/ })).toHaveText(/\d{6}/);
	});
});

test('caregiver pickup PIN validation changes the trip status only for the correct PIN', async ({
	baseURL,
	context,
	page,
	browser,
}) => {
	baseURL = requireBaseURL(baseURL);
	const booking = await createPendingBooking('2090-09-06T20:30:00Z');
	await openAcceptedTrip(context, page, baseURL, booking);
	await startTrip(page);
	const pickupPin = await readPickupPin(browser, baseURL, booking.bookingId);

	const pinInput = page.getByLabel(pinLabel);
	await pinInput.fill(makeDifferentPin(pickupPin));
	await page.getByRole('button', { name: confirmPickupActionLabel }).click();
	await expect(page.getByText(invalidPinError)).toBeVisible();
	await expect(page.getByText(enRouteToSchoolStatus)).toBeVisible();

	await pinInput.fill(pickupPin);
	await page.getByRole('button', { name: confirmPickupActionLabel }).click();
	await expect(page.getByText(childPickedUpStatus)).toBeVisible();

	await withParentBooking(browser, baseURL, booking.bookingId, async (parentPage) => {
		await expect(parentPage.getByText(eventPickupConfirmed)).toHaveCount(1);
	});
});

test('caregiver completes a direct trip from pickup to home', async ({
	baseURL,
	context,
	page,
	browser,
}) => {
	baseURL = requireBaseURL(baseURL);
	const booking = await openPickedUpTrip({
		context,
		page,
		browser,
		baseURL,
		scheduledPickupAt: '2090-09-07T20:30:00Z',
	});

	await goHomeAndFinishTrip(page);
	await expect(page.getByText(tripCompleteMessage)).toBeVisible();
	await expectParentEventHistory(browser, baseURL, booking.bookingId, [
		...pickedUpEventHistory,
		eventTransition(TripStatus.CHILD_PICKED_UP, TripStatus.EN_ROUTE_HOME),
		eventTransition(TripStatus.EN_ROUTE_HOME, TripStatus.COMPLETED),
	]);
});

test('caregiver can visit or skip an activity before completing a trip', async ({
	baseURL,
	context,
	page,
	browser,
}) => {
	baseURL = requireBaseURL(baseURL);
	const activityBooking = await openPickedUpTrip({
		context,
		page,
		browser,
		baseURL,
		scheduledPickupAt: '2090-09-08T20:30:00Z',
		withActivity: true,
	});

	await page.getByRole('button', { name: arriveAtActivityAction }).click();
	await expect(page.getByText(atActivityStatus)).toBeVisible();
	await goHomeAndFinishTrip(page);
	await expectParentEventHistory(browser, baseURL, activityBooking.bookingId, [
		...pickedUpEventHistory,
		eventTransition(TripStatus.CHILD_PICKED_UP, TripStatus.AT_ACTIVITY),
		eventTransition(TripStatus.AT_ACTIVITY, TripStatus.EN_ROUTE_HOME),
		eventTransition(TripStatus.EN_ROUTE_HOME, TripStatus.COMPLETED),
	]);

	const skippedActivityBooking = await openPickedUpTrip({
		context,
		page,
		browser,
		baseURL,
		scheduledPickupAt: '2090-09-09T20:30:00Z',
		withActivity: true,
	});

	await page.getByRole('button', { name: skipActivityAction }).click();
	await expect(page.getByText(enRouteHomeStatus)).toBeVisible();
	await finishTrip(page);
	await expectParentEventHistory(browser, baseURL, skippedActivityBooking.bookingId, [
		...pickedUpEventHistory,
		eventTransition(TripStatus.CHILD_PICKED_UP, TripStatus.EN_ROUTE_HOME),
		eventTransition(TripStatus.EN_ROUTE_HOME, TripStatus.COMPLETED),
	]);
});

test('caregiver can cancel before pickup but not after handoff', async ({
	baseURL,
	context,
	page,
	browser,
}) => {
	baseURL = requireBaseURL(baseURL);
	const cancelledBooking = await createPendingBooking('2090-09-10T20:30:00Z');
	await openAcceptedTrip(context, page, baseURL, cancelledBooking);

	await page.getByRole('button', { name: cancelTripAction }).click();
	await expect(page.getByText(cancelledStatus)).toBeVisible();
	await expect(page.getByRole('button', { name: startTripAction })).toHaveCount(0);
	await expectParentEventHistory(browser, baseURL, cancelledBooking.bookingId, [
		eventUpdated,
		eventTransition(TripStatus.SCHEDULED, TripStatus.CANCELLED),
	]);

	const pickedUpBooking = await createPendingBooking('2090-09-11T20:30:00Z');
	const tripUrl = await openAcceptedTrip(context, page, baseURL, pickedUpBooking);
	await startTrip(page);
	const staleCancellationPage = await context.newPage();
	await staleCancellationPage.goto(tripUrl);
	await confirmPickup(page, await readPickupPin(browser, baseURL, pickedUpBooking.bookingId));

	await staleCancellationPage.getByRole('button', { name: cancelTripAction }).click();
	await expect(staleCancellationPage.getByText(invalidTransitionError)).toBeVisible();
	await page.reload();
	await expect(page.getByText(childPickedUpStatus)).toBeVisible();
	await staleCancellationPage.close();

	await expect(page.getByRole('button', { name: cancelTripAction })).toHaveCount(0);
});

test('repeated submission advances a trip once and records one event', async ({
	baseURL,
	context,
	page,
	browser,
}) => {
	baseURL = requireBaseURL(baseURL);
	const booking = await createPendingBooking('2090-09-12T20:30:00Z');
	const tripUrl = await openAcceptedTrip(context, page, baseURL, booking);
	const retryPage = await context.newPage();
	await retryPage.goto(tripUrl);
	const startForm = page
		.getByRole('button', { name: startTripAction })
		.locator('xpath=ancestor::form');
	const retryForm = retryPage
		.getByRole('button', { name: startTripAction })
		.locator('xpath=ancestor::form');
	const originalIdempotencyKey = await startForm
		.locator('input[name="idempotencyKey"]')
		.inputValue();
	await retryForm.locator('input[name="idempotencyKey"]').evaluate((input, value) => {
		(input as HTMLInputElement).value = value;
	}, originalIdempotencyKey);

	await startTrip(page);
	await retryPage.getByRole('button', { name: startTripAction }).click();
	await expect(retryPage.getByText(invalidTransitionError)).toBeVisible();
	await retryPage.close();

	await expectParentEventHistory(browser, baseURL, booking.bookingId, [
		eventUpdated,
		eventTransition(TripStatus.SCHEDULED, TripStatus.EN_ROUTE_TO_SCHOOL),
	]);
});

test('a stale cancellation is applied against the latest server state', async ({
	baseURL,
	context,
	page,
}) => {
	baseURL = requireBaseURL(baseURL);
	const booking = await createPendingBooking('2090-09-13T20:30:00Z');
	const tripUrl = await openAcceptedTrip(context, page, baseURL, booking);
	const stalePage = await context.newPage();
	await stalePage.goto(tripUrl);

	await startTrip(page);
	await stalePage.getByRole('button', { name: cancelTripAction }).click();

	await expect(stalePage.getByText(cancelledStatus)).toBeVisible();
	await page.reload();
	await expect(page.getByText(cancelledStatus)).toBeVisible();
	await stalePage.close();
});

test('guardians and unrelated users cannot open caregiver trip controls', async ({
	baseURL,
	context,
	page,
	browser,
}) => {
	baseURL = requireBaseURL(baseURL);
	const booking = await createPendingBooking('2090-09-14T20:30:00Z');
	const tripUrl = await openAcceptedTrip(context, page, baseURL, booking);

	for (const sessionToken of [parentSessionToken, unrelatedUserSessionToken]) {
		const unauthorizedContext = await browser.newContext();
		const unauthorizedPage = await unauthorizedContext.newPage();
		await authenticate(unauthorizedContext, baseURL, sessionToken);
		const response = await unauthorizedPage.goto(tripUrl);

		expect(response?.status()).toBe(404);
		await expect(unauthorizedPage.getByRole('button', { name: startTripAction })).toHaveCount(0);
		await unauthorizedContext.close();
	}
});
