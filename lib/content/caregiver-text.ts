export const caregiverText = {
	accessRevoked: {
		title: 'Your caregiver access has been revoked',
		description:
			'Your caregiver profile has been saved. Contact support if you believe this is a mistake.',
	},
	onboarding: {
		title: 'Become a caregiver',
		description: 'Tell families about your experience and vehicle.',
		submit: 'Submit for verification',
		saveError: 'Unable to create your caregiver profile. Please try again.',
	},
	profile: {
		title: 'Caregiver profile',
		edit: 'Edit profile',
		rate: 'Hourly rate',
		vehicle: 'Vehicle',
		noVehicle: 'No vehicle details provided',
		status: 'Verification status',
		documents: 'Verification documents',
		noDocuments: 'No verification documents submitted yet.',
		statusLabels: {
			PENDING_VERIFICATION: 'Pending verification',
			VERIFIED: 'Verified',
			SUSPENDED: 'Suspended',
		},
		documentTypeLabels: {
			DRIVERS_LICENSE: "Driver's license",
			BACKGROUND_CHECK: 'Background check',
			INSURANCE: 'Insurance',
		},
		documentStatusLabels: {
			PENDING: 'Pending',
			APPROVED: 'Approved',
			REJECTED: 'Rejected',
		},
	},
	edit: {
		title: 'Edit caregiver profile',
		submit: 'Save changes',
		saveError: 'Unable to update your caregiver profile. Please try again.',
	},
	assignments: {
		title: 'Assignments',
		description: 'Your upcoming assignments will appear here.',
	},
	validationError: 'Please fix the highlighted fields.',
	optional: 'Optional',
	cancel: 'Cancel',
	fields: {
		bio: {
			label: 'About you',
			invalid: 'Bio must be 1,000 characters or less',
		},
		hourlyRate: {
			label: 'Hourly rate (USD)',
			required: 'Hourly rate is required',
			invalid: 'Enter an hourly rate between $5 and $500',
		},
		vehicleMake: { label: 'Vehicle make' },
		vehicleModel: { label: 'Vehicle model' },
		vehicleYear: {
			label: 'Vehicle year',
			invalid: 'Enter a vehicle year from the last 30 years',
		},
		vehicleColor: { label: 'Vehicle color' },
		licensePlate: {
			label: 'License plate',
			invalid: 'Use 2–10 letters, numbers, spaces, or hyphens',
		},
	},
} as const;
