import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { LocationType } from '@/generated/prisma/enums';
import { locationFormText } from '@/lib/content/location-form-text';
import {
	createOwnedChild,
	createOwnedLocation,
	requireE2EEnvironmentVariable,
} from '@/e2e/helpers/database';

const secondSessionToken = requireE2EEnvironmentVariable(
	'E2E_SECOND_SESSION_TOKEN',
);
const ownerEmail = requireE2EEnvironmentVariable('SEED_OWNER_EMAIL');

async function createPrivateData() {
	const child = {
		firstName: `Private-${randomUUID().slice(0, 8)}`,
		lastName: 'Child',
		birthDate: '2015-04-10',
	};
	const location = {
		type: LocationType.ACTIVITY,
		name: `Private Studio ${randomUUID().slice(0, 8)}`,
		addressLine1: '789 Pine St',
		city: 'Chicago',
		state: 'IL',
		postalCode: '60602',
	};

	const [childId, locationId] = await Promise.all([
		createOwnedChild(ownerEmail, child),
		createOwnedLocation(ownerEmail, location),
	]);

	return {
		child: {
			...child,
			fullName: `${child.firstName} ${child.lastName}`,
			path: `/children/${childId}`,
		},
		location: {
			...location,
			editPath: `/locations/${locationId}/edit`,
		},
	};
}

test("keeps each user's private data isolated", async ({
	baseURL,
	browser,
}) => {
	if (!baseURL) throw new Error('Playwright baseURL is required');

	const secondUser = { fullName: 'Devid Krasinski' };
	const { child, location } = await createPrivateData();
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
