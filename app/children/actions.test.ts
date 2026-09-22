import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dateFromToday } from '@/test/date';
import { GuardianRelationship } from '@/generated/prisma/enums';
import {
	childFormText,
	createChildFormText,
	editChildFormText,
} from '@/lib/content/child-form-text';

const {
	fields: { birthDate: birthDateText, relationship: relationshipText },
} = childFormText;
const { saveError } = createChildFormText;

const mocks = vi.hoisted(() => ({
	createChildForCurrentUser: vi.fn(),
	updateChildForCurrentUser: vi.fn(),
	archiveChildForCurrentUser: vi.fn(),
	revalidatePath: vi.fn(),
	redirect: vi.fn(),
}));

vi.mock('@/lib/data/children', () => ({
	createChildForCurrentUser: mocks.createChildForCurrentUser,
	updateChildForCurrentUser: mocks.updateChildForCurrentUser,
	archiveChildForCurrentUser: mocks.archiveChildForCurrentUser,
}));

vi.mock('next/cache', () => ({
	revalidatePath: mocks.revalidatePath,
}));

vi.mock('next/navigation', () => ({
	redirect: mocks.redirect,
}));

import {
	createChildAction,
	archiveChildAction,
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
		expect(mocks.createChildForCurrentUser).not.toHaveBeenCalled();
		expect(mocks.redirect).not.toHaveBeenCalled();
	});

	it('requires a relationship when creating a child', async () => {
		const result = await createChildAction(
			initialState,
			createFormData({
				firstName: 'Miles',
				lastName: 'Davis',
				birthDate: dateFromToday({ years: -6 }),
			}),
		);

		expect(result.errors?.relationship?.[0]).toBe(relationshipText.invalid);
		expect(mocks.createChildForCurrentUser).not.toHaveBeenCalled();
	});

	it('creates a child and redirects to the children list', async () => {
		mocks.createChildForCurrentUser.mockResolvedValue(undefined);
		const birthDate = dateFromToday({ years: -6 });

		await createChildAction(
			initialState,
			createFormData({
				firstName: '  Miles  ',
				lastName: '  Davis  ',
				birthDate,
				relationship: GuardianRelationship.MOTHER,
			}),
		);

		expect(mocks.createChildForCurrentUser).toHaveBeenCalledWith({
			firstName: 'Miles',
			lastName: 'Davis',
			birthDate,
			relationship: GuardianRelationship.MOTHER,
		});
		expect(mocks.revalidatePath).toHaveBeenCalledWith('/children');
		expect(mocks.redirect).toHaveBeenCalledWith('/children');
	});

	it('returns a general message when saving fails', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		mocks.createChildForCurrentUser.mockRejectedValue(new Error('Database unavailable'));
		const birthDate = dateFromToday({ years: -6 });

		const result = await createChildAction(
			initialState,
			createFormData({
				firstName: 'Miles',
				lastName: 'Davis',
				birthDate,
				relationship: GuardianRelationship.GUARDIAN,
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

		const result = await editChildAction(child.id, initialState, createFormData(child));

		expect(result.message).toBe(childFormText.validationError);
		expect(result.errors?.birthDate?.[0]).toBe(childFormText.fields.birthDate.required);
		expect(mocks.updateChildForCurrentUser).not.toHaveBeenCalled();
		expect(mocks.redirect).not.toHaveBeenCalled();
	});

	it('updates validated child data and redirects to the child page', async () => {
		const child = {
			id: 'child-1',
			firstName: 'Miles',
			lastName: 'Davis',
			birthDate: dateFromToday({ years: -6 }),
		};
		mocks.updateChildForCurrentUser.mockResolvedValue({ count: 1 });

		await editChildAction(
			child.id,
			initialState,
			createFormData({
				...child,
				firstName: `  ${child.firstName}  `,
				lastName: `  ${child.lastName}  `,
			}),
		);

		expect(mocks.updateChildForCurrentUser).toHaveBeenCalledWith(child.id, {
			firstName: child.firstName,
			lastName: child.lastName,
			birthDate: child.birthDate,
		});
		expect(mocks.revalidatePath).toHaveBeenNthCalledWith(1, '/children');
		expect(mocks.revalidatePath).toHaveBeenNthCalledWith(2, `/children/${child.id}`);
		expect(mocks.redirect).toHaveBeenCalledWith(`/children/${child.id}`);
	});

	it('returns the same message when no authorized child was updated', async () => {
		const child = {
			id: 'missing-child',
			firstName: 'Miles',
			lastName: 'Davis',
			birthDate: dateFromToday({ years: -6 }),
		};
		mocks.updateChildForCurrentUser.mockResolvedValue({ count: 0 });

		const result = await editChildAction(child.id, initialState, createFormData(child));

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
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		mocks.updateChildForCurrentUser.mockRejectedValue(error);

		const result = await editChildAction(child.id, initialState, createFormData(child));

		expect(result.message).toBe(editChildFormText.saveError);
		expect(consoleError).toHaveBeenCalledWith('Failed to update child', error);
		expect(mocks.redirect).not.toHaveBeenCalled();

		consoleError.mockRestore();
	});
});

describe('archiveChildAction', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('archives the child and check children page revalidation', async () => {
		const child = { id: 'child-1' };
		mocks.archiveChildForCurrentUser.mockResolvedValue({ count: 1 });

		await archiveChildAction(child.id);

		expect(mocks.archiveChildForCurrentUser).toHaveBeenCalledWith(child.id);
		expect(mocks.revalidatePath).toHaveBeenCalledWith('/children');
		expect(mocks.redirect).toHaveBeenCalledWith('/children');
	});

	it('does not reveal why no child was archived', async () => {
		const child = { id: 'missing-child' };
		mocks.archiveChildForCurrentUser.mockResolvedValue({ count: 0 });

		await expect(archiveChildAction(child.id)).resolves.toBeUndefined();
		expect(mocks.revalidatePath).toHaveBeenCalledWith('/children');
		expect(mocks.redirect).toHaveBeenCalledWith('/children');
	});

	it('throws DB archive errors', async () => {
		const child = { id: 'child-1' };
		const error = new Error('Database unavailable');
		mocks.archiveChildForCurrentUser.mockRejectedValue(error);

		await expect(archiveChildAction(child.id)).rejects.toBe(error);
		expect(mocks.revalidatePath).not.toHaveBeenCalled();
		expect(mocks.redirect).not.toHaveBeenCalled();
	});
});
