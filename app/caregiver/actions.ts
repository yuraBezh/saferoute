'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { caregiverText } from '@/lib/content/caregiver-text';
import {
	createCaregiverProfileForCurrentUser,
	updateCaregiverProfileForCurrentUser,
} from '@/lib/data/caregivers';
import { caregiverProfileSchema } from '@/lib/validation/caregiver';

export type CaregiverFormState = {
	message: string;
	errors?: Partial<Record<keyof z.infer<typeof caregiverProfileSchema>, string[] | undefined>>;
};

const parseCaregiverForm = (formData: FormData) =>
	caregiverProfileSchema.safeParse({
		bio: formData.get('bio'),
		hourlyRate: formData.get('hourlyRate'),
		vehicleMake: formData.get('vehicleMake'),
		vehicleModel: formData.get('vehicleModel'),
		vehicleYear: formData.get('vehicleYear'),
		vehicleColor: formData.get('vehicleColor'),
		licensePlate: formData.get('licensePlate'),
	});

export async function createCaregiverProfileAction(
	_prevState: CaregiverFormState,
	formData: FormData,
): Promise<CaregiverFormState> {
	const parsed = parseCaregiverForm(formData);
	if (!parsed.success) {
		return {
			message: caregiverText.validationError,
			errors: z.flattenError(parsed.error).fieldErrors,
		};
	}

	try {
		await createCaregiverProfileForCurrentUser(parsed.data);
	} catch (error) {
		console.error('Failed to create caregiver profile', error);
		return { message: caregiverText.onboarding.saveError, errors: {} };
	}

	revalidatePath('/caregiver');
	redirect('/caregiver');
}

export async function updateCaregiverProfileAction(
	_prevState: CaregiverFormState,
	formData: FormData,
): Promise<CaregiverFormState> {
	const parsed = parseCaregiverForm(formData);
	if (!parsed.success) {
		return {
			message: caregiverText.validationError,
			errors: z.flattenError(parsed.error).fieldErrors,
		};
	}

	try {
		const result = await updateCaregiverProfileForCurrentUser(parsed.data);
		if (result.count === 0) {
			return { message: caregiverText.edit.saveError, errors: {} };
		}
	} catch (error) {
		console.error('Failed to update caregiver profile', error);
		return { message: caregiverText.edit.saveError, errors: {} };
	}

	revalidatePath('/caregiver');
	redirect('/caregiver');
}
