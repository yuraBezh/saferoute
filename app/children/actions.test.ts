import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dateFromToday } from '@/test/date';
import {
	childFormText,
	createChildFormText,
	editChildFormText,
} from '@/lib/content/child-form-text';
import { RECORD_NOT_FOUND_ERROR_CODE } from '@/lib/prisma-error-codes';

const {
	fields: { birthDate: birthDateText },
} = childFormText;
const { saveError } = createChildFormText;

const mocks = vi.hoisted(() => ({
	createChild: vi.fn(),
	updateChild: vi.fn(),
	deleteChild: vi.fn(),
	revalidatePath: vi.fn(),
	redirect: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
	prisma: {
		child: {
			create: mocks.createChild,
			update: mocks.updateChild,
			delete: mocks.deleteChild,
		},
	},
}));

vi.mock('next/cache', () => ({
	revalidatePath: mocks.revalidatePath,
}));

vi.mock('next/navigation', () => ({
	redirect: mocks.redirect,
}));

import {
	createChildAction,
	deleteChildAction,
	editChildAction,
	type ChildFormState,
} from '@/app/children/actions';

const initialState: ChildFormState = { message: '', errors: {} };

function createFormData(values: Record<string, string>) {
	const formData = new FormData();

	for (const [key, value] of Object.entries(values)) {
		formData.set(key, value);
	}

	return formData;
}

describe('createChildAction', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns field errors and does not write invalid data', async () => {
		const result = await createChildAction(
			initialState,
			createFormData({
				firstName: 'Miles',
				lastName: 'Davis',
				birthDate: '',
			}),
		);

		expect(result.message).toBe(childFormText.validationError);
		expect(result.errors?.birthDate?.[0]).toBe(birthDateText.required);
		expect(mocks.createChild).not.toHaveBeenCalled();
		expect(mocks.redirect).not.toHaveBeenCalled();
	});

	it('creates a child from validated data and redirects home', async () => {
		mocks.createChild.mockResolvedValue({});
		const birthDate = dateFromToday({ years: -6 });

		await createChildAction(
			initialState,
			createFormData({
				firstName: '  Miles  ',
				lastName: '  Davis  ',
				birthDate,
			}),
		);

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
		const consoleError = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);
		mocks.createChild.mockRejectedValue(new Error('Database unavailable'));
		const birthDate = dateFromToday({ years: -6 });

		const result = await createChildAction(
			initialState,
			createFormData({
				firstName: 'Miles',
				lastName: 'Davis',
				birthDate,
			}),
		);

		expect(result).toEqual({
			message: saveError,
			errors: {},
		});
		expect(mocks.redirect).not.toHaveBeenCalled();
		consoleError.mockRestore();
	});
});

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

		expect(result.message).toBe(childFormText.validationError);
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

describe('deleteChildAction', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deletes the child and check children page revalidation', async () => {
		const child = { id: 'child-1' };
		mocks.deleteChild.mockResolvedValue({});

		await deleteChildAction(child.id);

		expect(mocks.deleteChild).toHaveBeenCalledWith({
			where: { id: child.id },
		});
		expect(mocks.revalidatePath).toHaveBeenCalledWith('/children');
	});

	it('treats an already deleted child as a successful deletion', async () => {
		const child = { id: 'missing-child' };
		mocks.deleteChild.mockRejectedValue({
			code: RECORD_NOT_FOUND_ERROR_CODE,
		});

		await expect(deleteChildAction(child.id)).resolves.toBeUndefined();
		expect(mocks.revalidatePath).toHaveBeenCalledWith('/children');
	});

	it('throws DB deletion errors', async () => {
		const child = { id: 'child-1' };
		const error = new Error('Database unavailable');
		mocks.deleteChild.mockRejectedValue(error);

		await expect(deleteChildAction(child.id)).rejects.toBe(error);
		expect(mocks.revalidatePath).not.toHaveBeenCalled();
	});
});
