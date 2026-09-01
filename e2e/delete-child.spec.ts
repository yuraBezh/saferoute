import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import childDetailsText from '@/lib/content/child-details-text';
import {
	createOwnedChild,
	requireE2EEnvironmentVariable,
} from '@/e2e/helpers/database';

const ownerEmail = requireE2EEnvironmentVariable('SEED_OWNER_EMAIL');

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
	const childId = await createOwnedChild(ownerEmail, child);
	const childPath = `/children/${childId}`;

	await page.goto(childPath);

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

	await page.goto(childPath);
	await expect(
		page.getByRole('heading', { name: notFoundPage.statusCode }),
	).toBeVisible();
	await expect(
		page.getByRole('heading', { name: notFoundPage.message }),
	).toBeVisible();
});
