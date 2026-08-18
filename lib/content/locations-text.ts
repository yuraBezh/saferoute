import { LocationType } from '@/generated/prisma/enums';

export const locationsText = {
	title: 'Locations',
	description: 'Manage the places used for pickups, activities, and drop-offs.',
	addLocation: 'Add location',
	empty: {
		title: 'No locations yet',
		description: 'Add your first location to start planning routes.',
		cta: 'Add your first location',
	},
	groupTitles: {
		[LocationType.HOME]: 'Homes',
		[LocationType.SCHOOL]: 'Schools',
		[LocationType.ACTIVITY]: 'Activities',
	},
	verified: 'Verified',
	edit: 'Edit',
} as const;
