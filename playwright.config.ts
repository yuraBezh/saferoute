import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:3100';
const sessionToken = process.env.E2E_SESSION_TOKEN;

if (!sessionToken) {
	throw new Error('Run Playwright through npm run test:e2e');
}

export default defineConfig({
	testDir: './e2e',
	fullyParallel: false,
	workers: 1,
	retries: 0,
	reporter: 'list',
	use: {
		baseURL,
		trace: 'retain-on-failure',
		storageState: {
			cookies: [
				{
					name: 'authjs.session-token',
					value: sessionToken,
					domain: '127.0.0.1',
					path: '/',
					expires: -1,
					httpOnly: true,
					secure: false,
					sameSite: 'Lax',
				},
			],
			origins: [],
		},
	},
	webServer: {
		command: 'npm run dev -- --hostname 127.0.0.1 --port 3100',
		url: baseURL,
		reuseExistingServer: false,
		timeout: 120_000,
	},
	projects: [
		{
			name: 'chromium',
			use: devices['Desktop Chrome'],
		},
	],
});
