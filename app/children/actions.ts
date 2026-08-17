'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { childSchema } from '@/lib/validation/child';
import { prisma } from '@/lib/prisma';
import {
	childFormText,
	createChildFormText,
	editChildFormText,
} from '@/lib/content/child-form-text';
import { RECORD_NOT_FOUND_ERROR_CODE } from '@/lib/prisma-error-codes';
import { z } from 'zod';

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

function toChildData(data: z.infer<typeof childSchema>) {
	return {
		firstName: data.firstName,
		lastName: data.lastName,
		birthDate: new Date(`${data.birthDate}T00:00:00.000Z`),
	};
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
		await prisma.child.create({
			data: toChildData(parsed.data),
		});
	} catch (err: unknown) {
		console.error('Failed to create child:', err);

		return {
			message: createChildFormText.saveError,
			errors: {},
		};
	}

	revalidatePath('/');
	redirect('/');
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
		await prisma.child.update({
			where: { id },
			data: toChildData(parsed.data),
		});
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
		await prisma.child.delete({ where: { id } });
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
