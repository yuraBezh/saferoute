'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
	createLocationFormText,
	editLocationFormText,
	locationFormText,
} from '@/lib/content/location-form-text';
import { locationSchema } from '@/lib/validation/location';
import {
	createLocationForCurrentUser,
	deleteLocationForCurrentUser,
	updateLocationForCurrentUser,
} from '@/lib/data/locations';

export type LocationFormState = {
	message: string;
	errors?: Partial<
		Record<keyof z.infer<typeof locationSchema>, string[] | undefined>
	>;
};

function parseLocationForm(formData: FormData) {
	return locationSchema.safeParse({
		type: formData.get('type'),
		name: formData.get('name'),
		addressLine1: formData.get('addressLine1'),
		addressLine2: formData.get('addressLine2'),
		city: formData.get('city'),
		state: formData.get('state'),
		postalCode: formData.get('postalCode'),
	});
}

export async function createLocationAction(
	_prevState: LocationFormState,
	formData: FormData,
): Promise<LocationFormState> {
	const parsed = parseLocationForm(formData);

	if (!parsed.success) {
		return {
			message: locationFormText.validationError,
			errors: z.flattenError(parsed.error).fieldErrors,
		};
	}

	try {
		await createLocationForCurrentUser(parsed.data);
	} catch (error) {
		console.error('Failed to create location', error);
		return { message: createLocationFormText.saveError, errors: {} };
	}

	revalidatePath('/locations');
	redirect('/locations');
}

export async function editLocationAction(
	id: string,
	_prevState: LocationFormState,
	formData: FormData,
): Promise<LocationFormState> {
	const parsed = parseLocationForm(formData);

	if (!parsed.success) {
		return {
			message: locationFormText.validationError,
			errors: z.flattenError(parsed.error).fieldErrors,
		};
	}

	try {
		const result = await updateLocationForCurrentUser(id, parsed.data);

		if (result.count === 0) {
			return { message: editLocationFormText.notFoundError, errors: {} };
		}
	} catch (error) {
		console.error('Failed to update location', error);
		return { message: editLocationFormText.saveError, errors: {} };
	}

	revalidatePath('/locations');
	redirect('/locations');
}

export async function deleteLocationAction(id: string): Promise<void> {
	const result = await deleteLocationForCurrentUser(id);

	if (result.count === 0) {
		throw new Error('Location not found or access denied');
	}

	revalidatePath('/locations');
	redirect('/locations');
}
