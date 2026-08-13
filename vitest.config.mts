import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		environment: 'jsdom',
		include: ['**/*.test.{ts,tsx}'],
		setupFiles: ['./vitest.setup.ts'],
		coverage: {
			provider: 'v8',
			include: [
				'app/**/*.{ts,tsx}',
				'components/**/*.{ts,tsx}',
				'lib/**/*.{ts,tsx}',
			],
			exclude: ['app/generated/**', '**/*.test.{ts,tsx}', 'lib/prisma.ts'],
			reporter: ['text', 'html'],
			thresholds: {
				lines: 80,
				functions: 80,
				statements: 80,
				branches: 80,
			},
		},
	},
});
