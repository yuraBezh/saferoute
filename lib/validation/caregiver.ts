import * as z from 'zod';
import { caregiverText } from '@/lib/content/caregiver-text';
import { toCents } from '@/lib/money';

const { fields } = caregiverText;
const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.transform((value) => value || null);

export const caregiverProfileSchema = z.object({
	bio: z
		.string()
		.trim()
		.max(1000, { error: fields.bio.invalid })
		.transform((value) => value || null),
	hourlyRate: z
		.string({ error: fields.hourlyRate.required })
		.trim()
		.min(1, { error: fields.hourlyRate.required })
		.regex(/^\d+(?:\.\d{1,2})?$/, { error: fields.hourlyRate.invalid })
		.refine((value) => {
			const cents = toCents(value);
			return cents >= 500 && cents <= 50000;
		}, fields.hourlyRate.invalid),
	vehicleMake: optionalText(50),
	vehicleModel: optionalText(50),
	vehicleYear: z
		.string()
		.trim()
		.refine((value) => {
			if (!value) return true;
			const year = Number(value);
			const currentYear = new Date().getFullYear();
			return /^\d{4}$/.test(value) && year <= currentYear && year >= currentYear - 30;
		}, fields.vehicleYear.invalid)
		.transform((value) => (value ? Number(value) : null)),
	vehicleColor: optionalText(30),
	licensePlate: z
		.string()
		.trim()
		.refine((value) => !value || /^[A-Z0-9 -]{2,10}$/i.test(value), {
			error: fields.licensePlate.invalid,
		})
		.transform((value) => value || null),
});

export type CaregiverFormValues = z.input<typeof caregiverProfileSchema>;
export type CaregiverProfileInput = z.output<typeof caregiverProfileSchema>;
