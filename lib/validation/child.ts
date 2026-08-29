import * as z from 'zod';
import { childFormText } from '@/lib/content/child-form-text';

const getTodayAsISO = () => new Date().toISOString().slice(0, 10);
const {
	firstName: firstNameText,
	lastName: lastNameText,
	birthDate: birthDateText,
} = childFormText.fields;

export const childSchema = z.object({
	firstName: z
		.string({ error: firstNameText.invalid })
		.trim()
		.min(1, { error: firstNameText.required })
		.max(50),
	lastName: z
		.string({ error: lastNameText.invalid })
		.trim()
		.min(1, { error: lastNameText.required })
		.max(50),
	birthDate: z
		.string({ error: birthDateText.required })
		.min(1, { error: birthDateText.required })
		.regex(/^\d{4}-\d{2}-\d{2}$/, birthDateText.invalid)
		.refine(
			(birthDate) => {
				const today = getTodayAsISO();
				return birthDate <= today;
			},
			{ error: birthDateText.future },
		)
		.refine(
			(birthDate) => {
				const today = getTodayAsISO();
				const [year, month, day] = today.split('-');
				const eighteenYearsAgo = Number(year) - 18;
				const eighteenYearsAgoToday = [eighteenYearsAgo, month, day].join('-');

				return birthDate > eighteenYearsAgoToday;
			},
			{ error: birthDateText.tooOld },
		)
		.refine(
			(birthDate) => {
				const today = getTodayAsISO();
				const [year, month, day] = today.split('-');
				const threeYearsAgoToday = [Number(year) - 3, month, day].join('-');

				return birthDate <= threeYearsAgoToday;
			},
			{ error: birthDateText.tooYoung },
		),
});

export type ChildInput = z.infer<typeof childSchema>;
