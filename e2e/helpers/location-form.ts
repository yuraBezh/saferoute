import type { Page } from '@playwright/test';
import type { LocationType } from '@/generated/prisma/enums';
import {
	createLocationFormText,
	locationFormText,
} from '@/lib/content/location-form-text';

type LocationFormValues = {
	type: LocationType;
	name: string;
	addressLine1: string;
	addressLine2?: string;
	city: string;
	state: string;
	postalCode: string;
};

export async function fillAndSubmitLocationForm(
	page: Page,
	location: LocationFormValues,
) {
	const { fields } = locationFormText;

	await page.getByLabel(fields.type.label).selectOption(location.type);
	await page.getByLabel(fields.name.label).fill(location.name);
	await page.getByLabel(fields.addressLine1.label).fill(location.addressLine1);

	if (location.addressLine2 !== undefined) {
		await page
			.getByLabel(fields.addressLine2.label)
			.fill(location.addressLine2);
	}

	await page.getByLabel(fields.city.label).fill(location.city);
	await page.getByLabel(fields.state.label).selectOption(location.state);
	await page.getByLabel(fields.postalCode.label).fill(location.postalCode);
	await page
		.getByRole('button', { name: createLocationFormText.submit })
		.click();
}
