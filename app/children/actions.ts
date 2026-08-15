'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { childSchema } from '@/lib/validation/child';
import { prisma } from '@/lib/prisma';
import { createChildFormText } from '@/lib/content/child-form-text';

export type ChildFormState = {
	message: string;
	errors?: {
		firstName?: string[];
		lastName?: string[];
		birthDate?: string[];
	};
};

export async function childFormAction(
	_formState: ChildFormState,
	formData: FormData,
): Promise<ChildFormState> {
	try {
		const firstName = formData.get('firstName');
		const lastName = formData.get('lastName');
		const birthDate = formData.get('birthDate');

		const result = childSchema.safeParse({ firstName, lastName, birthDate });

		if (!result.success) {
			const { fieldErrors } = result.error.flatten();

			return {
				message: '',
				errors: fieldErrors,
			};
		}

		await prisma.child.create({
			data: {
				firstName: result.data.firstName,
				lastName: result.data.lastName,
				birthDate: new Date(`${result.data.birthDate}T00:00:00.000Z`),
			},
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
