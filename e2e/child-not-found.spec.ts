import { expect, test } from '@playwright/test';

test('shows the not-found page for an unknown child', async ({ page }) => {
	const missingChild = { id: 'non-existent-child' };
	const notFoundPage = {
		statusCode: '404',
		message: 'This page could not be found.',
	};

	await page.goto(`/children/${missingChild.id}`);

	await expect(
		page.getByRole('heading', { name: notFoundPage.statusCode }),
	).toBeVisible();
	await expect(
		page.getByRole('heading', { name: notFoundPage.message }),
	).toBeVisible();
});
