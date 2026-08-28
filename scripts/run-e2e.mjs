import { spawnSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { config } from 'dotenv';

const isUiMode = process.argv.includes('--ui');

config({ path: '.env.e2e', override: true, quiet: true });

process.env.NEXT_DIST_DIR = '.next-e2e';
process.env.AUTH_URL = 'http://127.0.0.1:3100';
process.env.AUTH_SECRET = randomBytes(32).toString('base64url');
process.env.SEED_OWNER_EMAIL = 'mother@example.com';
process.env.E2E_SESSION_TOKEN = randomUUID();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is required in .env.e2e');
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

function run(command, args) {
	const result = spawnSync(command, args, {
		stdio: 'inherit',
		env: process.env,
	});

	if (result.error) {
		throw result.error;
	}

	if (result.signal) {
		throw new Error(`${command} was terminated by ${result.signal}`);
	}

	if (result.status !== 0) {
		throw new Error(
			`${command} exited with status ${result.status ?? 'unknown'}`,
		);
	}
}

run('docker', ['compose', '-f', 'docker-compose.e2e.yml', 'up', '-d', '--wait']);
run('npm', ['exec', '--', 'prisma', 'migrate', 'reset', '--force']);
run('npm', ['run', 'db:seed']);
run('npm', ['exec', '--', 'playwright', 'test', ...(isUiMode ? ['--ui'] : [])]);
