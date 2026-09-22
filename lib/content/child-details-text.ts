import { guardianRelationshipLabels } from '@/lib/content/child-form-text';

const childDetailsText = {
	actions: {
		edit: 'Edit',
		delete: 'Remove',
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
		delete: 'Remove',
		description:
			'This will remove this child from your account and hide their profile from guardians. Trip history is kept for safety records.',
		deleting: 'Removing…',
	},
	guardians: {
		title: 'Guardians',
		empty: 'No guardians added yet.',
		primary: 'Primary',
		canBook: 'Can book',
		viewOnly: 'View only',
		details: (relationship: string, email: string) => `${relationship} · ${email}`,
		relationships: guardianRelationshipLabels,
	},
} as const;
export default childDetailsText;
