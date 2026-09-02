import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { childSchema, createChildSchema } from '@/lib/validation/child';
import { GuardianRelationship } from '@/generated/prisma/enums';
import { dateFromToday } from '@/test/date';
import { childFormText } from '@/lib/content/child-form-text';

const {
	firstName: firstNameText,
	lastName: lastNameText,
	birthDate: birthDateText,
} = childFormText.fields;

const validChild = () => ({
	firstName: 'Miles',
	lastName: 'Davis',
	birthDate: dateFromToday({ years: -6 }),
});

describe('createChildSchema', () => {
	it('accepts a supported guardian relationship', () => {
		const child = {
			...validChild(),
			relationship: GuardianRelationship.FATHER,
		};

		expect(createChildSchema.safeParse(child)).toMatchObject({
			success: true,
			data: child,
		});
	});

	it('rejects a missing guardian relationship', () => {
		const result = createChildSchema.safeParse(validChild());

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.relationship).toContain(
				childFormText.fields.relationship.invalid,
			);
		}
	});
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
		['firstName', '', firstNameText.required],
		['lastName', '   ', lastNameText.required],
	] as const)(
		'returns a field error for an empty %s',
		(field, value, message) => {
			const result = childSchema.safeParse({ ...validChild(), [field]: value });

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.flatten().fieldErrors[field]).toContain(message);
			}
		},
	);

	it.each([
		['empty', (): string => '', birthDateText.required],
		['malformed', (): string => 'not-a-date', birthDateText.invalid],
		[
			'tomorrow',
			(): string => dateFromToday({ days: 1 }),
			birthDateText.future,
		],
		[
			'one day under 3 years old',
			(): string => dateFromToday({ years: -3, days: 1 }),
			birthDateText.tooYoung,
		],
		[
			'exactly 18 years old',
			(): string => dateFromToday({ years: -18 }),
			birthDateText.tooOld,
		],
		[
			'one day over 18 years old',
			(): string => dateFromToday({ years: -18, days: -1 }),
			birthDateText.tooOld,
		],
	] as const)(
		'rejects a %s birth date with a specific error',
		(_case, getBirthDate, message) => {
			const result = childSchema.safeParse({
				...validChild(),
				birthDate: getBirthDate(),
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.flatten().fieldErrors.birthDate).toContain(message);
			}
		},
	);
});
