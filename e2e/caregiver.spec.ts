import { expect, test } from '@playwright/test';
import { caregiverText, formatHourlyRate } from '@/lib/content/caregiver-text';
import { headerText } from '@/lib/content/header-text';
import { requireE2EEnvironmentVariable } from '@/e2e/helpers/database';
import { authenticate } from '@/e2e/helpers/auth';

const dualRoleSessionToken = requireE2EEnvironmentVariable('E2E_DUAL_ROLE_SESSION_TOKEN');
const suspendedCaregiverSessionToken = requireE2EEnvironmentVariable(
	'E2E_SUSPENDED_CAREGIVER_SESSION_TOKEN',
);
const editedProfileFixture = {
	bio: 'Available for weekday school pickups',
	hourlyRate: '32.25',
};

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
