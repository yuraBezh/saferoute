import { expect, test, type BrowserContext } from '@playwright/test';
import { CaregiverStatus } from '@/generated/prisma/enums';
import { caregiverText, formatHourlyRate } from '@/lib/content/caregiver-text';
import { headerText } from '@/lib/content/header-text';
import { requireE2EEnvironmentVariable } from '@/e2e/helpers/database';

const dualRoleSessionToken = requireE2EEnvironmentVariable('E2E_DUAL_ROLE_SESSION_TOKEN');
const onboardingSessionToken = requireE2EEnvironmentVariable('E2E_ONBOARDING_SESSION_TOKEN');
const suspendedCaregiverSessionToken = requireE2EEnvironmentVariable(
	'E2E_SUSPENDED_CAREGIVER_SESSION_TOKEN',
);
const onboardingFixture = {
	bio: 'Experienced after-school caregiver',
	hourlyRate: '30.75',
	vehicleMake: 'Subaru',
	vehicleModel: 'Ascent',
	vehicleYear: '2023',
	vehicleColor: 'Green',
	licensePlate: 'SAFE-321',
};
const editedProfileFixture = {
	bio: 'Available for weekday school pickups',
	hourlyRate: '32.25',
};

const authenticate = async (context: BrowserContext, baseURL: string, sessionToken: string) => {
	await context.clearCookies();
	await context.addCookies([
		{
			name: 'authjs.session-token',
			value: sessionToken,
			url: baseURL,
		},
	]);
};

test('a parent completes caregiver onboarding', async ({ baseURL, context, page }) => {
	const { fields, onboarding, profile } = caregiverText;
	const { bio, hourlyRate, vehicleMake, vehicleModel, vehicleYear, vehicleColor, licensePlate } =
		onboardingFixture;
	if (!baseURL) throw new Error('Playwright baseURL is required');
	await authenticate(context, baseURL, onboardingSessionToken);

	await page.goto('/caregiver/onboarding');
	await page.getByLabel(fields.bio.label, { exact: false }).fill(bio);
	await page.getByLabel(fields.hourlyRate.label).fill(hourlyRate);
	await page.getByLabel(fields.vehicleMake.label, { exact: false }).fill(vehicleMake);
	await page.getByLabel(fields.vehicleModel.label, { exact: false }).fill(vehicleModel);
	await page.getByLabel(fields.vehicleYear.label, { exact: false }).fill(vehicleYear);
	await page.getByLabel(fields.vehicleColor.label, { exact: false }).fill(vehicleColor);
	await page.getByLabel(fields.licensePlate.label, { exact: false }).fill(licensePlate);
	await page.getByRole('button', { name: onboarding.submit }).click();

	await expect(page).toHaveURL('/caregiver');
	await expect(
		page.getByText(profile.statusLabels[CaregiverStatus.PENDING_VERIFICATION], {
			exact: false,
		}),
	).toBeVisible();
	await expect(page.getByText(formatHourlyRate(hourlyRate))).toBeVisible();
	await expect(
		page.getByRole('banner').getByRole('link', {
			name: headerText.navigation.assignments,
		}),
	).toBeVisible();
});

test('a caregiver edits their profile and opens assignments', async ({
	baseURL,
	context,
	page,
}) => {
	const { bio, hourlyRate } = editedProfileFixture;
	const { fields, edit, assignments } = caregiverText;
	if (!baseURL) throw new Error('Playwright baseURL is required');
	await authenticate(context, baseURL, dualRoleSessionToken);

	await page.goto('/caregiver/edit');
	await page.getByLabel(fields.bio.label, { exact: false }).fill(bio);
	await page.getByLabel(fields.hourlyRate.label).fill(hourlyRate);
	await page.getByRole('button', { name: edit.submit }).click();

	await expect(page).toHaveURL('/caregiver');
	await expect(page.getByText(bio)).toBeVisible();
	await expect(page.getByText(formatHourlyRate(hourlyRate))).toBeVisible();

	await page
		.getByRole('banner')
		.getByRole('link', { name: headerText.navigation.assignments })
		.click();
	await expect(page).toHaveURL('/caregiver/assignments');
	await expect(page.getByText(assignments.description)).toBeVisible();
});

test('a suspended caregiver cannot access caregiver pages', async ({ baseURL, context, page }) => {
	const { accessRevoked, profile, assignments } = caregiverText;
	if (!baseURL) throw new Error('Playwright baseURL is required');
	await authenticate(context, baseURL, suspendedCaregiverSessionToken);

	for (const path of ['/caregiver', '/caregiver/edit', '/caregiver/assignments']) {
		await page.goto(path);
		await expect(page.getByRole('heading', { name: accessRevoked.title })).toBeVisible();
		await expect(page.getByText(accessRevoked.description)).toBeVisible();
		await expect(page.getByRole('heading', { name: profile.title })).toHaveCount(0);
		await expect(page.getByText(assignments.description)).toHaveCount(0);
	}
});
