import { expect, test } from '@playwright/test';
import { headerText } from '@/lib/content/header-text';

const userFixture = {
	fullName: 'Anna Krasinski',
	initials: 'AK',
};

const routesFixture = {
	home: '/',
	children: '/children',
	locations: '/locations',
	signIn: '/signin',
};

test('shows authenticated navigation in the root layout', async ({ page }) => {
	await page.goto(routesFixture.children);

	const header = page.getByRole('banner');
	await expect(header.getByText(userFixture.fullName)).toBeVisible();
	await expect(header.getByText(userFixture.initials)).toBeVisible();
	await expect(header.getByRole('link', { name: headerText.brand })).toHaveAttribute(
		'href',
		routesFixture.home,
	);
	await expect(header.getByRole('link', { name: headerText.navigation.locations })).toHaveAttribute(
		'href',
		routesFixture.locations,
	);
	await expect(header.getByRole('button', { name: headerText.signOut })).toBeVisible();
});

test('redirects an unauthenticated root request to sign in', async ({ context, page }) => {
	await context.clearCookies();

	await page.goto('/');

	await expect(page).toHaveURL(routesFixture.signIn);
});
