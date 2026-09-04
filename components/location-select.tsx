'use client';

import { useState } from 'react';
import { SelectField } from '@/components/ui/select-field';
import { bookingFormText } from '@/lib/content/booking-form-text';

type LocationFieldName = 'pickupLocationId' | 'activityLocationId' | 'dropoffLocationId';

type LocationSelectProps = {
	name: LocationFieldName;
	label: string;
	locations: { id: string; name: string }[];
	error?: string;
	required: boolean;
};

const { fields, optional } = bookingFormText;

export function LocationSelect({ name, label, locations, error, required }: LocationSelectProps) {
	const [value, setValue] = useState('');

	return (
		<SelectField
			id={name}
			label={label}
			optionalLabel={required ? undefined : optional}
			error={error}
			name={name}
			required={required}
			value={value}
			onChange={(event) => setValue(event.target.value)}
		>
			<option value="">{fields[name].placeholder}</option>
			{locations.map(({ id, name: locationName }) => (
				<option key={id} value={id}>
					{locationName}
				</option>
			))}
		</SelectField>
	);
}
