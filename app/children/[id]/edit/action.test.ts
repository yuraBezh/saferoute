import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dateFromToday } from '@/test/date';
import {
	childFormText,
	editChildFormText,
} from '@/lib/content/child-form-text';
import { RECORD_NOT_FOUND_ERROR_CODE } from '@/lib/prisma-error-codes';

const mocks = vi.hoisted(() => ({
	updateChild: vi.fn(),
	revalidatePath: vi.fn(),
	redirect: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
	prisma: { child: { update: mocks.updateChild } },
}));

vi.mock('next/cache', () => ({
	revalidatePath: mocks.revalidatePath,
}));

vi.mock('next/navigation', () => ({
	redirect: mocks.redirect,
}));

import { editChildAction } from './action';
import type { ChildFormState } from '@/app/children/actions';

const initialState: ChildFormState = { message: '', errors: {} };

function createFormData(values: Record<string, string>) {
	const formData = new FormData();

	for (const [key, value] of Object.entries(values)) {
		formData.set(key, value);
	}

	return formData;
}

describe('editChildAction', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns validation errors without updating the child', async () => {
		const child = {
			id: 'child-1',
			firstName: 'Miles',
			lastName: 'Davis',
			birthDate: '',
		};

		const result = await editChildAction(
			child.id,
			initialState,
			createFormData(child),
		);

		expect(result.message).toBe(editChildFormText.validationError);
		expect(result.errors?.birthDate?.[0]).toBe(
			childFormText.fields.birthDate.required,
		);
		expect(mocks.updateChild).not.toHaveBeenCalled();
		expect(mocks.redirect).not.toHaveBeenCalled();
	});

	it('updates validated child data and redirects to the child page', async () => {
		const child = {
			id: 'child-1',
			firstName: 'Miles',
			lastName: 'Davis',
			birthDate: dateFromToday({ years: -6 }),
		};
		mocks.updateChild.mockResolvedValue({});

		await editChildAction(
			child.id,
			initialState,
			createFormData({
				...child,
				firstName: `  ${child.firstName}  `,
				lastName: `  ${child.lastName}  `,
			}),
		);

		expect(mocks.updateChild).toHaveBeenCalledWith({
			where: { id: child.id },
			data: {
				firstName: child.firstName,
				lastName: child.lastName,
				birthDate: new Date(`${child.birthDate}T00:00:00.000Z`),
			},
		});
		expect(mocks.revalidatePath).toHaveBeenNthCalledWith(1, '/children');
		expect(mocks.revalidatePath).toHaveBeenNthCalledWith(
			2,
			`/children/${child.id}`,
		);
		expect(mocks.redirect).toHaveBeenCalledWith(`/children/${child.id}`);
	});

	it('returns a specific message when the child no longer exists', async () => {
		const child = {
			id: 'missing-child',
			firstName: 'Miles',
			lastName: 'Davis',
			birthDate: dateFromToday({ years: -6 }),
		};
		mocks.updateChild.mockRejectedValue({
			code: RECORD_NOT_FOUND_ERROR_CODE,
		});

		const result = await editChildAction(
			child.id,
			initialState,
			createFormData(child),
		);

		expect(result.message).toBe(editChildFormText.notFoundError);
		expect(mocks.revalidatePath).not.toHaveBeenCalled();
		expect(mocks.redirect).not.toHaveBeenCalled();
	});

	it('returns a general message when updating fails', async () => {
		const child = {
			id: 'child-1',
			firstName: 'Miles',
			lastName: 'Davis',
			birthDate: dateFromToday({ years: -6 }),
		};
		const error = new Error('Database unavailable');
		const consoleError = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);
		mocks.updateChild.mockRejectedValue(error);

		const result = await editChildAction(
			child.id,
			initialState,
			createFormData(child),
		);

		expect(result.message).toBe(editChildFormText.saveError);
		expect(consoleError).toHaveBeenCalledWith('Failed to update child', error);
		expect(mocks.redirect).not.toHaveBeenCalled();

		consoleError.mockRestore();
	});
});
