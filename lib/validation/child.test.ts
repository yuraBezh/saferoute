import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { childSchema } from '@/lib/validation/child';
import { dateFromToday } from '@/test/date';

const validChild = () => ({
	firstName: 'Miles',
	lastName: 'Davis',
	birthDate: dateFromToday({ years: -6 }),
});

describe('childSchema', () => {
	beforeAll(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-08-11T12:00:00.000Z'));
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	it('accepts valid child data and trims names', () => {
		const child = validChild();
		const result = childSchema.safeParse({
			...child,
			firstName: '  Miles  ',
			lastName: '  Davis  ',
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual(child);
		}
	});

	it.each([
		['firstName', '', 'First name is required'],
		['lastName', '   ', 'Last name is required'],
	] as const)('returns a field error for an empty %s', (field, value, message) => {
		const result = childSchema.safeParse({ ...validChild(), [field]: value });

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors[field]).toContain(message);
		}
	});

	it.each([
		['empty', (): string => '', 'Birth date is required'],
		['malformed', (): string => 'not-a-date', 'Select a valid birth date'],
		['tomorrow', (): string => dateFromToday({ days: 1 }), 'Birth date cannot be in the future'],
		['one day under 3 years old', (): string => dateFromToday({ years: -3, days: 1 }), 'Child must be at least 3 years old'],
		['one day over 18 years old', (): string => dateFromToday({ years: -18, days: -1 }), 'Child must be younger than 18 years old'],
	] as const)('rejects a %s birth date with a specific error', (_case, getBirthDate, message) => {
		const result = childSchema.safeParse({
			...validChild(),
			birthDate: getBirthDate(),
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.birthDate).toContain(message);
		}
	});
});
