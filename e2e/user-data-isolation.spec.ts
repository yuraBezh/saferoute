import { randomUUID } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';
import { LocationType } from '@/generated/prisma/enums';
import {
	childFormText,
	createChildFormText,
} from '@/lib/content/child-form-text';
import { locationFormText } from '@/lib/content/location-form-text';
import { locationsText } from '@/lib/content/locations-text';
import { fillAndSubmitLocationForm } from '@/e2e/helpers/location-form';

const secondSessionToken = process.env.E2E_SECOND_SESSION_TOKEN;

if (!secondSessionToken) {
	throw new Error('Run Playwright through npm run test:e2e');
}

const {
	fields: {
		firstName: childFirstName,
		lastName: childLastName,
		birthDate: childBirthDate,
	},
} = childFormText;

async function createChild(page: Page) {
	const child = {
		firstName: `Private-${randomUUID().slice(0, 8)}`,
		lastName: 'Child',
		birthDate: '2015-04-10',
	};

	await page.goto('/children/new');
	await page.getByLabel(childFirstName.label).fill(child.firstName);
	await page.getByLabel(childLastName.label).fill(child.lastName);
	await page.getByLabel(childBirthDate.label).fill(child.birthDate);
	await page.getByRole('button', { name: createChildFormText.submit }).click();

	const fullName = `${child.firstName} ${child.lastName}`;
	await page.getByRole('link', { name: new RegExp(fullName) }).click();
	await expect(page).toHaveURL(/\/children\/[^/]+$/);

	return { ...child, fullName, path: new URL(page.url()).pathname };
}

async function createLocation(page: Page) {
	const location = {
		type: LocationType.ACTIVITY,
		name: `Private Studio ${randomUUID().slice(0, 8)}`,
		addressLine1: '789 Pine St',
		city: 'Chicago',
		state: 'IL',
		postalCode: '60602',
	};

	await page.goto('/locations/new');
	await fillAndSubmitLocationForm(page, location);

	await expect(page).toHaveURL('/locations');
	const locationRow = page
		.getByText(location.name, { exact: true })
		.locator('..')
		.locator('..')
		.locator('..');
	await locationRow.getByRole('link', { name: locationsText.edit }).click();
	await expect(page).toHaveURL(/\/locations\/[^/]+\/edit$/);

	return { ...location, editPath: new URL(page.url()).pathname };
}

test("keeps each user's private data isolated", async ({
	baseURL,
	browser,
	page: firstUserPage,
}) => {
	if (!baseURL) throw new Error('Playwright baseURL is required');

	const secondUser = { fullName: 'Devid Krasinski' };
	const child = await createChild(firstUserPage);
	const location = await createLocation(firstUserPage);
	const secondUserContext = await browser.newContext({ baseURL });

	await secondUserContext.addCookies([
		{
			name: 'authjs.session-token',
			value: secondSessionToken,
			url: baseURL,
		},
	]);

	try {
		const secondUserPage = await secondUserContext.newPage();

		await secondUserPage.goto('/children');
		await expect(
			secondUserPage
				.getByRole('banner')
				.getByText(secondUser.fullName, { exact: true }),
		).toBeVisible();
		await expect(
			secondUserPage.getByRole('link', {
				name: new RegExp(child.fullName),
			}),
		).toHaveCount(0);

		await secondUserPage.goto(child.path);
		await expect(
			secondUserPage.getByRole('heading', { name: child.fullName }),
		).toHaveCount(0);

		await secondUserPage.goto('/locations');
		await expect(
			secondUserPage.getByText(location.name, { exact: true }),
		).toHaveCount(0);

		await secondUserPage.goto(location.editPath);
		await expect(
			secondUserPage.getByLabel(locationFormText.fields.name.label),
		).toHaveCount(0);
	} finally {
		await secondUserContext.close();
	}
});
