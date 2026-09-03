import type { BrowserContext, Page } from '@playwright/test';

export const authenticate = async (
	context: BrowserContext,
	baseURL: string,
	sessionToken: string,
) => {
	await context.clearCookies();
	await context.addCookies([
		{
			name: 'authjs.session-token',
			value: sessionToken,
			url: baseURL,
		},
	]);
};

export const startGoogleSignIn = async (
	context: BrowserContext,
	page: Page,
	buttonName: string,
) => {
	await context.route('https://accounts.google.com/**', (route) => route.abort());
	const googleRequest = page.waitForRequest(
		(request) => new URL(request.url()).hostname === 'accounts.google.com',
	);

	await page.getByRole('button', { name: buttonName }).click();
	await googleRequest;
};
