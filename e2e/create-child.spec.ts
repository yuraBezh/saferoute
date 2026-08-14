import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { childFormText } from '@/lib/content/child-form-text';
import { childrenText } from '@/lib/content/children-text';

const {
	submit,
	fields: { firstName, lastName, birthDate },
} = childFormText;

test('creates a child and shows it in the children list', async ({ page }) => {
	const child = {
		firstName: `Evelyn-${randomUUID().slice(0, 8)}`,
		lastName: 'Parker',
		birthDate: '2015-04-10',
	};

	await page.goto('/children');
	await page.getByRole('link', { name: childrenText.addChild }).click();

	await page.getByLabel(firstName.label).fill(child.firstName);
	await page.getByLabel(lastName.label).fill(child.lastName);
	await page.getByLabel(birthDate.label).fill(child.birthDate);
	await page.getByRole('button', { name: submit }).click();

	await expect(page).toHaveURL('/children');
	await expect(
		page.getByRole('link', {
			name: new RegExp(`${child.firstName} ${child.lastName}`),
		}),
	).toBeVisible();
});
