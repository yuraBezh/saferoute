const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is required');
}

const url = new URL(databaseUrl);
const isE2eDatabase =
	process.env.ALLOW_DATABASE_RESET === 'true' &&
	['127.0.0.1', 'localhost'].includes(url.hostname) &&
	url.port === '5433' &&
	url.pathname === '/saferoute_e2e';

if (!isE2eDatabase) {
	throw new Error('Refusing to reset a non-E2E database');
}
