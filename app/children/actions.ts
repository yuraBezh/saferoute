'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { childSchema, createChildSchema } from '@/lib/validation/child';
import {
	childFormText,
	createChildFormText,
	editChildFormText,
} from '@/lib/content/child-form-text';
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
		relationship?: string[];
	};
};

export async function createChildAction(
	_prevState: ChildFormState,
	formData: FormData,
): Promise<ChildFormState> {
	const parsed = createChildSchema.safeParse({
		firstName: formData.get('firstName'),
		lastName: formData.get('lastName'),
		birthDate: formData.get('birthDate'),
		relationship: formData.get('relationship'),
	});

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
	const parsed = childSchema.safeParse({
		firstName: formData.get('firstName'),
		lastName: formData.get('lastName'),
		birthDate: formData.get('birthDate'),
	});

	if (!parsed.success) {
		return {
			message: childFormText.validationError,
			errors: z.flattenError(parsed.error).fieldErrors,
		};
	}

	try {
		const result = await updateChildForCurrentUser(id, parsed.data);

		if (result.count === 0) {
			return { message: editChildFormText.notFoundError };
		}
	} catch (err) {
		console.error('Failed to update child', err);
		return { message: editChildFormText.saveError };
	}

	revalidatePath('/children');
	revalidatePath(`/children/${id}`);
	redirect(`/children/${id}`);
}

export async function deleteChildAction(id: string): Promise<void> {
	await deleteChildForCurrentUser(id);

	revalidatePath('/children');
	redirect('/children');
}
