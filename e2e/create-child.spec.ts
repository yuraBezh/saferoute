import { expect, test } from '@playwright/test';
import { childFormText } from '@/lib/content/child-form-text';
import { childrenText } from '@/lib/content/children-text';

test('creates a child and shows it in the children list', async ({ page }) => {
	const child = {
		firstName: `Evelyn${Date.now()}`,
		lastName: 'Parker',
		birthDate: '2015-04-10',
	};

	await page.goto('/children');
	await page.getByRole('link', { name: childrenText.addChild }).click();

	await page
		.getByLabel(childFormText.fields.firstName.label)
		.fill(child.firstName);
	await page
		.getByLabel(childFormText.fields.lastName.label)
		.fill(child.lastName);
	await page
		.getByLabel(childFormText.fields.birthDate.label)
		.fill(child.birthDate);
	await page.getByRole('button', { name: childFormText.submit }).click();

	await expect(page).toHaveURL('/children');
	await expect(
		page.getByRole('link', {
			name: new RegExp(`${child.firstName} ${child.lastName}`),
		}),
	).toBeVisible();
});
