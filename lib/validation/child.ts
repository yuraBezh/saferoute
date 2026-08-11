import * as z from "zod";

const getTodayAsISO = () => new Date().toISOString().slice(0, 10);

export const childSchema = z.object({
	firstName: z.string({ error: 'Enter a valid first name' }).trim()
		.min(1, { error: 'First name is required' })
		.max(50),
	lastName: z.string({ error: 'Enter a valid last name' }).trim()
		.min(1, { error: 'Last name is required' })
		.max(50),
	birthDate: z.string({ error: 'Birth date is required' })
		.min(1, { error: 'Birth date is required' })
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Select a valid birth date')
		.refine(
			(birthDate) => {
				const today = getTodayAsISO();
				return birthDate <= today;
			},
			{ error: "Birth date cannot be in the future" }
		)
		.refine(
			(birthDate) => {
				const today = getTodayAsISO();
				const [year, month, day] = today.split('-');
				const eighteenYearsAgo = Number(year) - 18;
				const eighteenYearsAgoToday = [eighteenYearsAgo, month, day].join('-');

				return birthDate >= eighteenYearsAgoToday;
			},
			{ error: "Child must be younger than 18 years old" }
		)
		.refine(
			(birthDate) => {
				const today = getTodayAsISO();
				const [year, month, day] = today.split("-");
				const threeYearsAgoToday = [Number(year) - 3,	month, day ].join("-");

				return birthDate <= threeYearsAgoToday;
			},
			{ error: "Child must be at least 3 years old" },
		),
});

export type ChildInput = z.infer<typeof childSchema>;
