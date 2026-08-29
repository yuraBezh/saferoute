'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { childSchema } from '@/lib/validation/child';
import {
	childFormText,
	createChildFormText,
	editChildFormText,
} from '@/lib/content/child-form-text';
import { RECORD_NOT_FOUND_ERROR_CODE } from '@/lib/prisma-error-codes';
import { z } from 'zod';
import {
	createChildForCurrentUser,
	deleteChildForCurrentUser,
	updateChildForCurrentUser,
} from '@/lib/data/children';

export type ChildFormState = {
	message: string;
	errors?: {
		firstName?: string[];
		lastName?: string[];
		birthDate?: string[];
	};
};

function parseChildForm(formData: FormData) {
	return childSchema.safeParse({
		firstName: formData.get('firstName'),
		lastName: formData.get('lastName'),
		birthDate: formData.get('birthDate'),
	});
}

export async function createChildAction(
	_prevState: ChildFormState,
	formData: FormData,
): Promise<ChildFormState> {
	const parsed = parseChildForm(formData);

	if (!parsed.success) {
		return {
			message: childFormText.validationError,
			errors: z.flattenError(parsed.error).fieldErrors,
		};
	}

	try {
		await createChildForCurrentUser(parsed.data);
	} catch (err: unknown) {
		console.error('Failed to create child:', err);

		return {
			message: createChildFormText.saveError,
			errors: {},
		};
	}

	revalidatePath('/children');
	redirect('/children');
}

export async function editChildAction(
	id: string,
	_prevState: ChildFormState,
	formData: FormData,
): Promise<ChildFormState> {
	const parsed = parseChildForm(formData);

	if (!parsed.success) {
		return {
			message: childFormText.validationError,
			errors: z.flattenError(parsed.error).fieldErrors,
		};
	}

	try {
		await updateChildForCurrentUser(id, parsed.data);
	} catch (err) {
		if (
			err &&
			typeof err === 'object' &&
			'code' in err &&
			err.code === RECORD_NOT_FOUND_ERROR_CODE
		) {
			return { message: editChildFormText.notFoundError };
		}

		console.error('Failed to update child', err);
		return { message: editChildFormText.saveError };
	}

	revalidatePath('/children');
	revalidatePath(`/children/${id}`);
	redirect(`/children/${id}`);
}

export async function deleteChildAction(id: string): Promise<void> {
	try {
		await deleteChildForCurrentUser(id);
	} catch (err) {
		if (
			!err ||
			typeof err !== 'object' ||
			!('code' in err) ||
			err.code !== RECORD_NOT_FOUND_ERROR_CODE
		) {
			throw err;
		}
	}

	revalidatePath('/children');
	redirect('/children');
}
