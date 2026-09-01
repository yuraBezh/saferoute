'use client';

import { startTransition, useActionState, useState } from 'react';
import { Field } from '@/components/ui/field';
import { FormActions } from '@/components/ui/form-actions';
import { FormError } from '@/components/ui/form-error';
import { SelectField } from '@/components/ui/select-field';
import {
	EMPTY_VALUES,
	LOCATION_TYPE_OPTIONS,
	type LocationFormProps,
	type LocationFormValues,
} from '@/components/location-form/config';
import { locationFormText } from '@/lib/content/location-form-text';
import { US_STATE_CODES } from '@/lib/validation/location';
import type { LocationFormState } from '@/app/locations/actions';

const {
	cancel,
	optional,
	fields: {
		type: typeText,
		name: nameText,
		addressLine1: addressLine1Text,
		addressLine2: addressLine2Text,
		city: cityText,
		state: stateText,
		postalCode: postalCodeText,
	},
} = locationFormText;

export function LocationForm({
	action: formAction,
	defaultValues,
	submitLabel,
	cancelHref,
	footerAction,
}: LocationFormProps) {
	const initialState: LocationFormState = { message: '', errors: {} };
	const [formState, action, isPending] = useActionState(
		formAction,
		initialState,
	);
	const [values, setValues] = useState(defaultValues ?? EMPTY_VALUES);

	return (
		<div className="w-full">
			<form
				action={action}
				onSubmit={(event) => {
					event.preventDefault();
					const formData = new FormData(event.currentTarget);

					startTransition(() => action(formData));
				}}
				noValidate
				className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
			>
				<div className="space-y-5">
					<SelectField
						id="type"
						label={typeText.label}
						error={formState.errors?.type?.[0]}
						name="type"
						value={values.type}
						onChange={(event) =>
							setValues({
								...values,
								type: event.target.value as LocationFormValues['type'],
							})
						}
					>
						<option value="">{typeText.placeholder}</option>
						{LOCATION_TYPE_OPTIONS.map(({ value, label }) => (
							<option key={value} value={value}>
								{label}
							</option>
						))}
					</SelectField>
					<Field
						id="name"
						label={nameText.label}
						error={formState.errors?.name?.[0]}
						name="name"
						value={values.name}
						onChange={(event) =>
							setValues({ ...values, name: event.target.value })
						}
					/>
					<Field
						id="addressLine1"
						label={addressLine1Text.label}
						error={formState.errors?.addressLine1?.[0]}
						name="addressLine1"
						value={values.addressLine1}
						onChange={(event) =>
							setValues({ ...values, addressLine1: event.target.value })
						}
						autoComplete="address-line1"
					/>
					<Field
						id="addressLine2"
						label={addressLine2Text.label}
						optionalLabel={optional}
						error={formState.errors?.addressLine2?.[0]}
						name="addressLine2"
						value={values.addressLine2}
						onChange={(event) =>
							setValues({ ...values, addressLine2: event.target.value })
						}
						autoComplete="address-line2"
					/>
					<div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
						<Field
							id="city"
							label={cityText.label}
							error={formState.errors?.city?.[0]}
							name="city"
							value={values.city}
							onChange={(event) =>
								setValues({ ...values, city: event.target.value })
							}
							autoComplete="address-level2"
						/>
						<SelectField
							id="state"
							label={stateText.label}
							error={formState.errors?.state?.[0]}
							name="state"
							value={values.state}
							onChange={(event) =>
								setValues({ ...values, state: event.target.value })
							}
							autoComplete="address-level1"
						>
							<option value="">{stateText.placeholder}</option>
							{US_STATE_CODES.map((state) => (
								<option key={state} value={state}>
									{state}
								</option>
							))}
						</SelectField>
						<Field
							id="postalCode"
							label={postalCodeText.label}
							error={formState.errors?.postalCode?.[0]}
							name="postalCode"
							value={values.postalCode}
							onChange={(event) =>
								setValues({ ...values, postalCode: event.target.value })
							}
							autoComplete="postal-code"
						/>
					</div>
					<FormError message={formState.message} />
					<FormActions
						cancelHref={cancelHref}
						cancelLabel={cancel}
						isPending={isPending}
						secondaryAction={footerAction}
						submitLabel={submitLabel}
					/>
				</div>
			</form>
		</div>
	);
}
