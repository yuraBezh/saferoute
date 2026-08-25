import type { LocationFormState } from '@/app/locations/actions';
import { LocationType } from '@/generated/prisma/enums';
import { locationFormText } from '@/lib/content/location-form-text';
import type { ReactNode } from 'react';

export type LocationFormValues = {
	type: LocationType | '';
	name: string;
	addressLine1: string;
	addressLine2: string;
	city: string;
	state: string;
	postalCode: string;
};

export type LocationFormProps = {
	action: (
		state: LocationFormState,
		formData: FormData,
	) => Promise<LocationFormState>;
	defaultValues?: LocationFormValues;
	submitLabel: string;
	cancelHref?: string;
	footerAction?: ReactNode;
};

const typeText = locationFormText.fields.type;

export const LOCATION_TYPE_OPTIONS = [
	{ value: LocationType.HOME, label: typeText.options.home },
	{ value: LocationType.SCHOOL, label: typeText.options.school },
	{ value: LocationType.ACTIVITY, label: typeText.options.activity },
] as const;

export const EMPTY_VALUES: LocationFormValues = {
	type: '',
	name: '',
	addressLine1: '',
	addressLine2: '',
	city: '',
	state: '',
	postalCode: '',
};
