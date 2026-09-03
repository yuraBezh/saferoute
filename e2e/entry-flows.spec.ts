import { expect, test } from '@playwright/test';
import { caregiverText } from '@/lib/content/caregiver-text';
import { headerText } from '@/lib/content/header-text';
import { landingText } from '@/lib/content/landing-text';
import { authenticate, startGoogleSignIn } from '@/e2e/helpers/auth';
import { requireE2EEnvironmentVariable } from '@/e2e/helpers/database';

const parentSessionToken = requireE2EEnvironmentVariable('E2E_SESSION_TOKEN');
const onboardingSessionToken = requireE2EEnvironmentVariable('E2E_ONBOARDING_SESSION_TOKEN');

const {
	hero: { findCaregiver, becomeCaregiver },
} = landingText;
const {
	navigation: { children, locations, assignments, profile },
} = headerText;
const {
	fields,
	onboarding: { submit },
} = caregiverText;

const routesFixture = {
	home: '/',
	signIn: '/signin',
	children: '/children',
	caregiverOnboarding: '/caregiver/onboarding',
	caregiver: '/caregiver',
};

const onboardingFixture = {
	bio: 'Experienced after-school caregiver',
	hourlyRate: '30.75',
	vehicleMake: 'Subaru',
	vehicleModel: 'Ascent',
	vehicleYear: '2023',
	vehicleColor: 'Green',
	licensePlate: 'SAFE-321',
};

test('redirects an unauthenticated visitor from children to sign in', async ({ context, page }) => {
	await context.clearCookies();

	await page.goto(routesFixture.children);

	await expect(page).toHaveURL(routesFixture.signIn);
});

test('a parent enters from the landing page and sees parent navigation', async ({
	baseURL,
	context,
	page,
}) => {
	if (!baseURL) throw new Error('Playwright baseURL is required');
	await context.clearCookies();
	await page.goto(routesFixture.home);

	await startGoogleSignIn(context, page, findCaregiver);
	await authenticate(context, baseURL, parentSessionToken);
	await page.goto(routesFixture.home);

	await expect(page).toHaveURL(routesFixture.children);
	const header = page.getByRole('banner');
	await expect(header.getByRole('link', { name: children })).toBeVisible();
	await expect(header.getByRole('link', { name: locations })).toBeVisible();
});

test('a parent enters from the landing page and becomes a caregiver', async ({
	baseURL,
	context,
	page,
}) => {
	if (!baseURL) throw new Error('Playwright baseURL is required');
	const { bio, hourlyRate, vehicleMake, vehicleModel, vehicleYear, vehicleColor, licensePlate } =
		onboardingFixture;
	await context.clearCookies();
	await page.goto(routesFixture.home);

	await startGoogleSignIn(context, page, becomeCaregiver);
	await authenticate(context, baseURL, onboardingSessionToken);
	await page.goto(routesFixture.caregiverOnboarding);
	await page.getByLabel(fields.bio.label, { exact: false }).fill(bio);
	await page.getByLabel(fields.hourlyRate.label).fill(hourlyRate);
	await page.getByLabel(fields.vehicleMake.label, { exact: false }).fill(vehicleMake);
	await page.getByLabel(fields.vehicleModel.label, { exact: false }).fill(vehicleModel);
	await page.getByLabel(fields.vehicleYear.label, { exact: false }).fill(vehicleYear);
	await page.getByLabel(fields.vehicleColor.label, { exact: false }).fill(vehicleColor);
	await page.getByLabel(fields.licensePlate.label, { exact: false }).fill(licensePlate);
	await page.getByRole('button', { name: submit }).click();

	await expect(page).toHaveURL(routesFixture.caregiver);
	const header = page.getByRole('banner');
	for (const linkName of [children, locations, assignments, profile]) {
		await expect(header.getByRole('link', { name: linkName })).toBeVisible();
	}
});
