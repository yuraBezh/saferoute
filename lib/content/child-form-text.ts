export const childFormText = {
	cancel: 'Cancel',
	validationError: 'Please fix the highlighted fields.',
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
		relationship: {
			label: 'Your relationship to the child',
			invalid: 'Select your relationship to the child',
		},
	},
} as const;

export const guardianRelationshipLabels = {
	MOTHER: 'Mother',
	FATHER: 'Father',
	GUARDIAN: 'Legal guardian',
	OTHER: 'Other',
} as const;

export const createChildFormText = {
	title: 'Add a child',
	description: "Enter the child's information below.",
	submit: 'Create child',
	submitting: 'Creating…',
	saveError: 'Unable to save the child. Please try again.',
} as const;

export const editChildFormText = {
	title: 'Edit child',
	description: (fullName: string) => `Update ${fullName}'s information.`,
	submit: 'Save changes',
	submitting: 'Saving…',
	notFoundError: 'This child no longer exists.',
	saveError: 'Something went wrong. Please try again.',
} as const;
