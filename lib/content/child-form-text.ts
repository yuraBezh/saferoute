export const childFormText = {
	title: 'Add a child',
	description: "Enter the child's information below.",
	fields: {
		firstName: {
			label: 'First Name',
			invalid: 'Enter a valid first name',
			required: 'First name is required',
		},
		lastName: {
			label: 'Last Name',
			invalid: 'Enter a valid last name',
			required: 'Last name is required',
		},
		birthDate: {
			label: 'Birth Date',
			required: 'Birth date is required',
			invalid: 'Select a valid birth date',
			future: 'Birth date cannot be in the future',
			tooYoung: 'Child must be at least 3 years old',
			tooOld: 'Child must be younger than 18 years old',
		},
	},
	saveError: 'Unable to save the child. Please try again.',
	submit: 'Create child',
	submitting: 'Creating…',
} as const;
