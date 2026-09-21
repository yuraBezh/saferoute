'use client';

import { Field } from '@/components/ui/field';
import { FormActions } from '@/components/ui/form-actions';
import { FormError } from '@/components/ui/form-error';
import { SelectField } from '@/components/ui/select-field';
import { LOCATION_TYPE_OPTIONS, type LocationFormProps } from '@/components/location-form/config';
import { locationFormText } from '@/lib/content/location-form-text';
import { US_STATE_CODES } from '@/lib/validation/location';
import { useLocationFormState } from '@/components/location-form/use-location-form-state';

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
	preFillValue,
	submitLabel,
	cancelHref,
	footerAction,
}: LocationFormProps) {
	const { action, formMessage, getFieldError, isPending, submitForm, updateValue, values } =
		useLocationFormState({ formAction, preFillValue });

	return (
		<div className="w-full">
			<form
				action={action}
				onSubmit={submitForm}
				noValidate
				className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
			>
				<div className="space-y-5">
					<SelectField
						id="type"
						label={typeText.label}
						error={getFieldError('type')}
						name="type"
						value={values.type}
						onChange={(e) => updateValue('type', e.target.value)}
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
						error={getFieldError('name')}
						name="name"
						value={values.name}
						onChange={(e) => updateValue('name', e.target.value)}
					/>
					<Field
						id="addressLine1"
						label={addressLine1Text.label}
						error={getFieldError('addressLine1')}
						name="addressLine1"
						value={values.addressLine1}
						onChange={(e) => updateValue('addressLine1', e.target.value)}
						autoComplete="address-line1"
					/>
					<Field
						id="addressLine2"
						label={addressLine2Text.label}
						optionalLabel={optional}
						error={getFieldError('addressLine2')}
						name="addressLine2"
						value={values.addressLine2}
						onChange={(e) => updateValue('addressLine2', e.target.value)}
						autoComplete="address-line2"
					/>
					<div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
						<Field
							id="city"
							label={cityText.label}
							error={getFieldError('city')}
							name="city"
							value={values.city}
							onChange={(e) => updateValue('city', e.target.value)}
							autoComplete="address-level2"
						/>
						<SelectField
							id="state"
							label={stateText.label}
							error={getFieldError('state')}
							name="state"
							value={values.state}
							onChange={(e) => updateValue('state', e.target.value)}
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
							error={getFieldError('postalCode')}
							name="postalCode"
							value={values.postalCode}
							onChange={(e) => updateValue('postalCode', e.target.value)}
							autoComplete="postal-code"
						/>
					</div>
					<FormError message={formMessage} />
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
