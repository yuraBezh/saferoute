'use server';

import type { ChildFormState } from '@/app/children/actions';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { childSchema } from '@/lib/validation/child';
import { editChildFormText } from '@/lib/content/child-form-text';
import { z } from 'zod';

const RECORD_NOT_FOUND_ERROR_CODE = 'P2025';

function parseChildForm(formData: FormData) {
	const result = childSchema.safeParse({
		firstName: formData.get('firstName'),
		lastName: formData.get('lastName'),
		birthDate: formData.get('birthDate'),
	});

	if (!result.success) {
		const { fieldErrors } = z.flattenError(result.error);

		return {
			ok: false as const,
			state: {
				message: editChildFormText.validationError,
				errors: fieldErrors,
			},
		};
	}

	return { ok: true as const, data: result.data };
}

export async function editChildAction(
	id: string,
	_prevState: ChildFormState,
	formData: FormData,
): Promise<ChildFormState> {
	const parsed = parseChildForm(formData);
	if (!parsed.ok) return parsed.state;

	try {
		await prisma.child.update({
			where: { id },
			data: {
				...parsed.data,
				birthDate: new Date(`${parsed.data.birthDate}T00:00:00.000Z`),
			},
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
