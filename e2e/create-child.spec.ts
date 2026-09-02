import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import {
	childFormText,
	createChildFormText,
	guardianRelationshipLabels,
} from '@/lib/content/child-form-text';
import { childrenText } from '@/lib/content/children-text';
import { GuardianRelationship } from '@/generated/prisma/enums';

const {
	fields: { firstName, lastName, birthDate, relationship },
} = childFormText;
const { submit } = createChildFormText;

test('creates a child and shows it in the children list', async ({ page }) => {
	const child = {
		firstName: `Evelyn-${randomUUID().slice(0, 8)}`,
		lastName: 'Parker',
		birthDate: '2015-04-10',
		relationship: GuardianRelationship.MOTHER,
	};

	await page.goto('/children');
	await page.getByRole('link', { name: childrenText.addChild }).click();

	await page.getByLabel(firstName.label).fill(child.firstName);
	await page.getByLabel(lastName.label).fill(child.lastName);
	await page.getByLabel(birthDate.label).fill(child.birthDate);
	await page.getByLabel(relationship.label).selectOption(child.relationship);
	await page.getByRole('button', { name: submit }).click();

	await expect(page).toHaveURL('/children');
	await expect(
		page.getByRole('link', {
			name: new RegExp(`${child.firstName} ${child.lastName}`),
		}),
	).toBeVisible();

	await page
		.getByRole('link', {
			name: new RegExp(`${child.firstName} ${child.lastName}`),
		})
		.click();
	await expect(
		page.getByText(guardianRelationshipLabels[child.relationship], {
			exact: false,
		}),
	).toBeVisible();
});
