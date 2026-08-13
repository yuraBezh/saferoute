import { expect, test } from '@playwright/test';
import { childFormText } from '@/lib/content/child-form-text';

const {
	submit,
	fields: { firstName, lastName, birthDate },
} = childFormText;

test('shows errors for required child fields', async ({ page }) => {
	await page.goto('/children/new');
	await page.getByRole('button', { name: submit }).click();

	await expect(page.getByText(firstName.required)).toBeVisible();
	await expect(page.getByText(lastName.required)).toBeVisible();
	await expect(page.getByText(birthDate.required)).toBeVisible();
	await expect(page).toHaveURL('/children/new');
});

test('rejects a birth date in the future', async ({ page }) => {
	const child = {
		firstName: 'Evelyn',
		lastName: 'Parker',
		birthDate: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
	};

	await page.goto('/children/new');
	await page.getByLabel(firstName.label).fill(child.firstName);
	await page.getByLabel(lastName.label).fill(child.lastName);
	await page.getByLabel(birthDate.label).fill(child.birthDate);
	await page.getByRole('button', { name: submit }).click();

	await expect(page.getByText(birthDate.future)).toBeVisible();
	await expect(page).toHaveURL('/children/new');
});
