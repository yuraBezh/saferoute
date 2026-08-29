import { randomUUID } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';
import { LocationType } from '@/generated/prisma/enums';
import {
	editLocationFormText,
	locationFormText,
} from '@/lib/content/location-form-text';
import { locationsText } from '@/lib/content/locations-text';
import { formatAddress } from '@/lib/locations/format-address';
import { fillAndSubmitLocationForm } from '@/e2e/helpers/location-form';

const {
	fields: { type, name, addressLine1, addressLine2, city, state, postalCode },
} = locationFormText;

type LocationFixture = {
	type: LocationType;
	name: string;
	addressLine1: string;
	addressLine2: string;
	city: string;
	state: string;
	postalCode: string;
};

function createLocationFixture(): LocationFixture {
	return {
		type: LocationType.ACTIVITY,
		name: `Music Studio ${randomUUID().slice(0, 8)}`,
		addressLine1: '789 Pine St',
		addressLine2: 'Floor 2',
		city: 'Chicago',
		state: 'IL',
		postalCode: '60602',
	};
}

async function createLocation(page: Page, location: LocationFixture) {
	await page.goto('/locations/new');
	await fillAndSubmitLocationForm(page, location);
	await expect(page).toHaveURL('/locations');
}

async function openLocationEditor(page: Page, locationName: string) {
	const locationRow = page
		.getByText(locationName, { exact: true })
		.locator('..')
		.locator('..')
		.locator('..');

	await locationRow.getByRole('link', { name: locationsText.edit }).click();
	await expect(page).toHaveURL(/\/locations\/[^/]+\/edit$/);
}

test('prefills and updates an owned location', async ({ page }) => {
	const location = createLocationFixture();
	const updatedLocation = {
		...location,
		name: `Art Studio ${randomUUID().slice(0, 8)}`,
		addressLine2: 'Suite 4',
	};

	await createLocation(page, location);
	await openLocationEditor(page, location.name);

	for (const [label, value] of [
		[type.label, location.type],
		[name.label, location.name],
		[addressLine1.label, location.addressLine1],
		[addressLine2.label, location.addressLine2],
		[city.label, location.city],
		[state.label, location.state],
		[postalCode.label, location.postalCode],
	] as const) {
		await expect(page.getByLabel(label)).toHaveValue(value);
	}

	await page.getByLabel(name.label).fill(updatedLocation.name);
	await page.getByLabel(addressLine2.label).fill(updatedLocation.addressLine2);
	await page.getByRole('button', { name: editLocationFormText.submit }).click();

	await expect(page).toHaveURL('/locations');
	await expect(
		page.getByText(updatedLocation.name, { exact: true }),
	).toBeVisible();
	await expect(
		page.getByText(formatAddress(updatedLocation), { exact: true }),
	).toBeVisible();
	await expect(page.getByText(location.name, { exact: true })).toHaveCount(0);
});

test('deletes an owned location after confirmation', async ({ page }) => {
	const location = createLocationFixture();
	const { delete: deleteText } = editLocationFormText;

	await createLocation(page, location);
	await openLocationEditor(page, location.name);
	await page.getByRole('button', { name: deleteText.trigger }).click();

	const dialog = page.getByRole('alertdialog');
	await expect(
		dialog.getByRole('heading', { name: deleteText.confirm }),
	).toBeVisible();
	await expect(dialog).toContainText(deleteText.description);
	await dialog.getByRole('button', { name: deleteText.delete }).click();

	await expect(page).toHaveURL('/locations');
	await expect(page.getByText(location.name, { exact: true })).toHaveCount(0);
});
