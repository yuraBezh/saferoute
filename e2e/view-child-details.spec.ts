import { expect, test } from '@playwright/test';
import { childDetailsText } from '@/lib/content/child-details-text';

const { title, details, relationships } = childDetailsText.guardians;

test('shows a child and their guardians', async ({ page }) => {
	const child = {
		firstName: 'John',
		lastName: 'Krasinski',
	};
	const guardians = [
		{
			fullName: 'Anna Krasinski',
			email: 'mother@example.com',
			relationship: relationships.MOTHER,
		},
		{
			fullName: 'Devid Krasinski',
			email: 'father@example.com',
			relationship: relationships.FATHER,
		},
	];
	const fullName = `${child.firstName} ${child.lastName}`;

	await page.goto('/children');
	await page.getByRole('link', { name: new RegExp(fullName) }).click();

	await expect(page.getByRole('heading', { name: fullName })).toBeVisible();
	await expect(page.getByRole('heading', { name: title })).toBeVisible();

	for (const guardian of guardians) {
		await expect(
			page.getByRole('heading', { name: guardian.fullName }),
		).toBeVisible();
		await expect(
			page.getByText(details(guardian.relationship, guardian.email)),
		).toBeVisible();
	}
});
