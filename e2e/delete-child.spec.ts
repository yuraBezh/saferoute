import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import {
	childFormText,
	createChildFormText,
} from '@/lib/content/child-form-text';
import childDetailsText from '@/lib/content/child-details-text';

const {
	fields: { firstName, lastName, birthDate },
} = childFormText;

test('deletes a child after confirmation', async ({ page }) => {
	const child = {
		firstName: `Evelyn-${randomUUID().slice(0, 8)}`,
		lastName: 'Parker',
		birthDate: '2015-04-10',
	};
	const notFoundPage = {
		statusCode: '404',
		message: 'This page could not be found.',
	};
	const fullName = `${child.firstName} ${child.lastName}`;

	await page.goto('/children/new');
	await page.getByLabel(firstName.label).fill(child.firstName);
	await page.getByLabel(lastName.label).fill(child.lastName);
	await page.getByLabel(birthDate.label).fill(child.birthDate);
	await page.getByRole('button', { name: createChildFormText.submit }).click();

	await page.getByRole('link', { name: new RegExp(fullName) }).click();
	await expect(page).toHaveURL(/\/children\/[^/]+$/);
	const childUrl = page.url();

	await page
		.getByRole('button', { name: childDetailsText.actions.delete })
		.click();
	const dialog = page.getByRole('alertdialog');
	await expect(
		dialog.getByRole('heading', {
			name: childDetailsText.deleteModal.confirm,
		}),
	).toBeVisible();
	await expect(dialog).toContainText(childDetailsText.deleteModal.description);

	await dialog
		.getByRole('button', { name: childDetailsText.deleteModal.delete })
		.click();
	await expect(dialog).toBeHidden();

	await page.goto('/children');
	await expect(
		page.getByRole('link', { name: new RegExp(fullName) }),
	).toHaveCount(0);

	await page.goto(childUrl);
	await expect(
		page.getByRole('heading', { name: notFoundPage.statusCode }),
	).toBeVisible();
	await expect(
		page.getByRole('heading', { name: notFoundPage.message }),
	).toBeVisible();
});
