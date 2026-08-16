import { randomUUID } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';
import {
	childFormText,
	createChildFormText,
	editChildFormText,
} from '@/lib/content/child-form-text';
import childDetailsText from '@/lib/content/child-details-text';
import { dateFromToday } from '@/test/date';

const {
	fields: { firstName, lastName, birthDate },
} = childFormText;

type ChildFixture = {
	firstName: string;
	lastName: string;
	birthDate: string;
};

function uniqueFirstName() {
	return `Evelyn-${randomUUID().slice(0, 8)}`;
}

function formatDate(date: string) {
	return new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(new Date(`${date}T00:00:00.000Z`));
}

async function createChild(page: Page, child: ChildFixture) {
	await page.goto('/children/new');
	await page.getByLabel(firstName.label).fill(child.firstName);
	await page.getByLabel(lastName.label).fill(child.lastName);
	await page.getByLabel(birthDate.label).fill(child.birthDate);
	await page.getByRole('button', { name: createChildFormText.submit }).click();

	const fullName = `${child.firstName} ${child.lastName}`;
	await page.getByRole('link', { name: new RegExp(fullName) }).click();
	await page.getByRole('link', { name: childDetailsText.actions.edit }).click();
}

test('prefills and updates a child', async ({ page }) => {
	const child = {
		firstName: uniqueFirstName(),
		lastName: 'Parker',
		birthDate: dateFromToday({ years: -10 }),
	};
	const updatedChild = {
		...child,
		firstName: uniqueFirstName(),
	};

	await createChild(page, child);

	await expect(page.getByLabel(firstName.label)).toHaveValue(child.firstName);
	await expect(page.getByLabel(lastName.label)).toHaveValue(child.lastName);
	await expect(page.getByLabel(birthDate.label)).toHaveValue(child.birthDate);

	await page.getByLabel(firstName.label).fill(updatedChild.firstName);
	await page.getByRole('button', { name: editChildFormText.submit }).click();

	const updatedFullName = `${updatedChild.firstName} ${updatedChild.lastName}`;
	await expect(
		page.getByRole('heading', { name: updatedFullName }),
	).toBeVisible();

	await page.goto('/children');
	await expect(
		page.getByRole('link', { name: new RegExp(updatedFullName) }),
	).toBeVisible();
});

test('keeps child data when an edit is invalid', async ({ page }) => {
	const child = {
		firstName: uniqueFirstName(),
		lastName: 'Parker',
		birthDate: dateFromToday({ years: -10 }),
	};
	const invalidBirthDate = dateFromToday({ days: 1 });

	await createChild(page, child);
	await page.getByLabel(birthDate.label).fill(invalidBirthDate);
	await page.getByRole('button', { name: editChildFormText.submit }).click();

	await expect(page.getByText(birthDate.future)).toBeVisible();
	await expect(page.getByLabel(firstName.label)).toHaveValue(child.firstName);
	await expect(page.getByLabel(lastName.label)).toHaveValue(child.lastName);
	await expect(page.getByLabel(birthDate.label)).toHaveValue(invalidBirthDate);
	await expect(page).toHaveURL(/\/children\/[^/]+\/edit$/);

	await page.getByRole('link', { name: childFormText.cancel }).click();
	await expect(
		page.getByRole('heading', {
			name: `${child.firstName} ${child.lastName}`,
		}),
	).toBeVisible();
	await expect(page.getByText(formatDate(child.birthDate))).toBeVisible();
});
