import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { LocationType } from '@/generated/prisma/enums';
import {
	createLocationFormText,
	locationFormText,
} from '@/lib/content/location-form-text';
import { locationsText } from '@/lib/content/locations-text';
import { formatAddress } from '@/lib/locations/format-address';

const {
	fields: { type, name, addressLine1, addressLine2, city, state, postalCode },
} = locationFormText;

test('creates a location and shows it in the correct group', async ({
	page,
}) => {
	const location = {
		type: LocationType.SCHOOL,
		name: `Lincoln Elementary ${randomUUID().slice(0, 8)}`,
		addressLine1: '123 Main St',
		addressLine2: 'Suite 2',
		city: 'Chicago',
		state: 'IL',
		postalCode: '60601',
	};

	await page.goto('/locations');
	await page.getByRole('link', { name: locationsText.addLocation }).click();

	await page.getByLabel(type.label).selectOption(location.type);
	await page.getByLabel(name.label).fill(location.name);
	await page.getByLabel(addressLine1.label).fill(location.addressLine1);
	await page.getByLabel(addressLine2.label).fill(location.addressLine2);
	await page.getByLabel(city.label).fill(location.city);
	await page.getByLabel(state.label).selectOption(location.state);
	await page.getByLabel(postalCode.label).fill(location.postalCode);
	await page
		.getByRole('button', { name: createLocationFormText.submit })
		.click();

	await expect(page).toHaveURL('/locations');
	await expect(
		page.getByRole('heading', {
			name: locationsText.groupTitles[location.type],
		}),
	).toBeVisible();
	await expect(page.getByText(location.name, { exact: true })).toBeVisible();
	await expect(
		page.getByText(formatAddress(location), { exact: true }),
	).toBeVisible();
});

test('shows validation errors and preserves entered location data', async ({
	page,
}) => {
	const location = {
		type: LocationType.HOME,
		name: `Family Home ${randomUUID().slice(0, 8)}`,
		addressLine1: '456 Oak Ave',
		city: 'Chicago',
		state: 'IL',
		postalCode: 'invalid',
	};

	await page.goto('/locations/new');
	await page.getByLabel(type.label).selectOption(location.type);
	await page.getByLabel(name.label).fill(location.name);
	await page.getByLabel(addressLine1.label).fill(location.addressLine1);
	await page.getByLabel(city.label).fill(location.city);
	await page.getByLabel(state.label).selectOption(location.state);
	await page.getByLabel(postalCode.label).fill(location.postalCode);
	await page
		.getByRole('button', { name: createLocationFormText.submit })
		.click();

	await expect(page.getByText(postalCode.invalid)).toBeVisible();
	await expect(page).toHaveURL('/locations/new');
	await expect(page.getByLabel(type.label)).toHaveValue(location.type);
	await expect(page.getByLabel(name.label)).toHaveValue(location.name);
	await expect(page.getByLabel(addressLine1.label)).toHaveValue(
		location.addressLine1,
	);
	await expect(page.getByLabel(city.label)).toHaveValue(location.city);
	await expect(page.getByLabel(state.label)).toHaveValue(location.state);
	await expect(page.getByLabel(postalCode.label)).toHaveValue(
		location.postalCode,
	);
});
