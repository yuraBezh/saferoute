import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { LocationType } from '@/generated/prisma/enums';
import { locationFormText } from '@/lib/content/location-form-text';
import { locationsText } from '@/lib/content/locations-text';
import { formatAddress } from '@/lib/locations/format-address';
import { fillAndSubmitLocationForm } from '@/e2e/helpers/location-form';

const {
	fields: { type, name, addressLine1, city, state, postalCode },
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
	await fillAndSubmitLocationForm(page, location);

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
	await fillAndSubmitLocationForm(page, location);

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
