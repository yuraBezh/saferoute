import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dateFromToday } from '@/test/date';
import { childFormText } from '@/lib/children/child-form-text';

const { saveError, fields: { birthDate: birthDateText } } = childFormText;

const mocks = vi.hoisted(() => ({
	createChild: vi.fn(),
	revalidatePath: vi.fn(),
	redirect: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
	prisma: {
		child: {
			create: mocks.createChild,
		},
	},
}));

vi.mock('next/cache', () => ({
	revalidatePath: mocks.revalidatePath,
}));

vi.mock('next/navigation', () => ({
	redirect: mocks.redirect,
}));

import { childFormAction, type ChildFormState } from '@/app/children/actions';

const initialState: ChildFormState = { message: '', errors: {} };

function createFormData(values: Record<string, string>) {
	const formData = new FormData();

	for (const [key, value] of Object.entries(values)) {
		formData.set(key, value);
	}

	return formData;
}

describe('childFormAction', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns field errors and does not write invalid data', async () => {
		const result = await childFormAction(initialState, createFormData({
			firstName: 'Miles',
			lastName: 'Davis',
			birthDate: '',
		}));

		expect(result.errors?.birthDate?.[0]).toBe(birthDateText.required);
		expect(mocks.createChild).not.toHaveBeenCalled();
		expect(mocks.redirect).not.toHaveBeenCalled();
	});

	it('creates a child from validated data and redirects home', async () => {
		mocks.createChild.mockResolvedValue({});
		const birthDate = dateFromToday({ years: -6 });

		await childFormAction(initialState, createFormData({
			firstName: '  Miles  ',
			lastName: '  Davis  ',
			birthDate,
		}));

		expect(mocks.createChild).toHaveBeenCalledWith({
			data: {
				firstName: 'Miles',
				lastName: 'Davis',
				birthDate: new Date(`${birthDate}T00:00:00.000Z`),
			},
		});
		expect(mocks.revalidatePath).toHaveBeenCalledWith('/');
		expect(mocks.redirect).toHaveBeenCalledWith('/');
	});

	it('returns a general message when saving fails', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		mocks.createChild.mockRejectedValue(new Error('Database unavailable'));
		const birthDate = dateFromToday({ years: -6 });

		const result = await childFormAction(initialState, createFormData({
			firstName: 'Miles',
			lastName: 'Davis',
			birthDate,
		}));

		expect(result).toEqual({
			message: saveError,
			errors: {},
		});
		expect(mocks.redirect).not.toHaveBeenCalled();
		consoleError.mockRestore();
	});
});
