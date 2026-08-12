import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { getAge } from '@/lib/children/get-age';

describe('getAge', () => {
	beforeAll(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-08-12T12:00:00.000Z'));
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	it.each([
		['birthday has passed', '2010-01-01', 16],
		['birthday is today', '2010-08-12', 16],
		['birthday is tomorrow', '2010-08-13', 15],
		['birthday is later this year', '2010-12-31', 15],
	] as const)('%s', (_case, birthDate, expectedAge) => {
		expect(getAge(new Date(`${birthDate}T00:00:00.000Z`))).toBe(expectedAge);
	});
});
