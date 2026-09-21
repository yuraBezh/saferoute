'use client';

import type { CaregiverFormState } from '@/app/caregiver/actions';
import { Field } from '@/components/ui/field';
import { FORM_CONTROL_CLASS_NAME } from '@/components/ui/form-control';
import { FormActions } from '@/components/ui/form-actions';
import { FormError } from '@/components/ui/form-error';
import { caregiverText } from '@/lib/content/caregiver-text';
import type { CaregiverFormValues } from '@/lib/validation/caregiver';
import { useCaregiverFormState } from '@/components/use-caregiver-form-state';

const { fields, optional, cancel } = caregiverText;

type CaregiverFormProps = {
	action: (state: CaregiverFormState, formData: FormData) => Promise<CaregiverFormState>;
	preFillValue?: CaregiverFormValues;
	submitLabel: string;
	cancelHref: string;
};

export function CaregiverForm({
	action: formAction,
	preFillValue,
	submitLabel,
	cancelHref,
}: CaregiverFormProps) {
	const { action, formMessage, getFieldError, isPending, submitForm, updateValue, values } =
		useCaregiverFormState({ formAction, preFillValue });
	const { bio, hourlyRate, vehicleMake, vehicleModel, vehicleYear, vehicleColor, licensePlate } =
		values;

	return (
		<form
			action={action}
			onSubmit={submitForm}
			noValidate
			className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
		>
			<div className="space-y-5">
				<div>
					<label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-gray-800">
						{fields.bio.label} <span className="font-normal text-gray-500">{optional}</span>
					</label>
					<textarea
						id="bio"
						name="bio"
						rows={5}
						value={bio}
						onChange={(e) => updateValue('bio', e.target.value)}
						aria-invalid={Boolean(getFieldError('bio'))}
						aria-describedby={getFieldError('bio') ? 'bio-error' : undefined}
						className={FORM_CONTROL_CLASS_NAME}
					/>
					{getFieldError('bio') && (
						<p id="bio-error" className="mt-1.5 text-sm text-red-600">
							{getFieldError('bio')}
						</p>
					)}
				</div>
				<Field
					id="hourlyRate"
					name="hourlyRate"
					type="number"
					min="5"
					max="500"
					step="0.01"
					label={fields.hourlyRate.label}
					error={getFieldError('hourlyRate')}
					value={hourlyRate}
					onChange={(e) => updateValue('hourlyRate', e.target.value)}
					required
				/>
				<div className="grid gap-5 sm:grid-cols-2">
					<Field
						id="vehicleMake"
						name="vehicleMake"
						label={fields.vehicleMake.label}
						optionalLabel={optional}
						error={getFieldError('vehicleMake')}
						value={vehicleMake}
						onChange={(e) => updateValue('vehicleMake', e.target.value)}
					/>
					<Field
						id="vehicleModel"
						name="vehicleModel"
						label={fields.vehicleModel.label}
						optionalLabel={optional}
						error={getFieldError('vehicleModel')}
						value={vehicleModel}
						onChange={(e) => updateValue('vehicleModel', e.target.value)}
					/>
					<Field
						id="vehicleYear"
						name="vehicleYear"
						type="number"
						label={fields.vehicleYear.label}
						optionalLabel={optional}
						error={getFieldError('vehicleYear')}
						value={vehicleYear}
						onChange={(e) => updateValue('vehicleYear', e.target.value)}
					/>
					<Field
						id="vehicleColor"
						name="vehicleColor"
						label={fields.vehicleColor.label}
						optionalLabel={optional}
						error={getFieldError('vehicleColor')}
						value={vehicleColor}
						onChange={(e) => updateValue('vehicleColor', e.target.value)}
					/>
				</div>
				<Field
					id="licensePlate"
					name="licensePlate"
					label={fields.licensePlate.label}
					optionalLabel={optional}
					error={getFieldError('licensePlate')}
					value={licensePlate}
					onChange={(e) => updateValue('licensePlate', e.target.value)}
				/>
				<FormError message={formMessage} />
				<FormActions
					cancelHref={cancelHref}
					cancelLabel={cancel}
					isPending={isPending}
					submitLabel={submitLabel}
				/>
			</div>
		</form>
	);
}
