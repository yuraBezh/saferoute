const childDetailsText = {
	actions: {
		edit: 'Edit',
		delete: 'Delete',
	},
	details: {
		dateOfBirth: 'Date of birth',
		added: 'Added',
	},
	error: {
		title: 'Something went wrong',
		retry: 'Try again',
	},
	deleteModal: {
		confirm: 'Are you sure?',
		cancel: 'Cancel',
		delete: 'Delete',
		description:
			'This action cannot be undone. This will permanently delete this child and remove its data from our servers.',
		deleting: 'Deleting…',
	},
	guardians: {
		title: 'Guardians',
		empty: 'No guardians added yet.',
		primary: 'Primary',
		canBook: 'Can book',
		viewOnly: 'View only',
		details: (relationship: string, email: string) =>
			`${relationship} · ${email}`,
		relationships: {
			MOTHER: 'Mother',
			FATHER: 'Father',
			GUARDIAN: 'Guardian',
			OTHER: 'Other',
		},
	},
} as const;
export default childDetailsText;
