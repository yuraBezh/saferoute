'use client';

import { useActionState } from 'react';
import type { CaregiverFormState } from '@/app/caregiver/actions';
import { Field } from '@/components/ui/field';
import { FORM_CONTROL_CLASS_NAME } from '@/components/ui/form-control';
import { FormActions } from '@/components/ui/form-actions';
import { FormError } from '@/components/ui/form-error';
import { caregiverText } from '@/lib/content/caregiver-text';
import type { CaregiverFormValues } from '@/lib/validation/caregiver';

const { fields, optional, cancel } = caregiverText;

type CaregiverFormProps = {
	action: (state: CaregiverFormState, formData: FormData) => Promise<CaregiverFormState>;
	defaultValues?: CaregiverFormValues;
	submitLabel: string;
	cancelHref: string;
};

export function CaregiverForm({
	action: formAction,
	defaultValues,
	submitLabel,
	cancelHref,
}: CaregiverFormProps) {
	const [state, action, isPending] = useActionState(formAction, { message: '', errors: {} });
	const bioError = state.errors?.bio?.[0];

	return (
		<form
			action={action}
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
						defaultValue={defaultValues?.bio}
						aria-invalid={!!bioError}
						aria-describedby={bioError ? 'bio-error' : undefined}
						className={FORM_CONTROL_CLASS_NAME}
					/>
					{bioError && (
						<p id="bio-error" className="mt-1.5 text-sm text-red-600">
							{bioError}
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
					error={state.errors?.hourlyRate?.[0]}
					defaultValue={defaultValues?.hourlyRate}
					required
				/>
				<div className="grid gap-5 sm:grid-cols-2">
					<Field
						id="vehicleMake"
						name="vehicleMake"
						label={fields.vehicleMake.label}
						optionalLabel={optional}
						error={state.errors?.vehicleMake?.[0]}
						defaultValue={defaultValues?.vehicleMake}
					/>
					<Field
						id="vehicleModel"
						name="vehicleModel"
						label={fields.vehicleModel.label}
						optionalLabel={optional}
						error={state.errors?.vehicleModel?.[0]}
						defaultValue={defaultValues?.vehicleModel}
					/>
					<Field
						id="vehicleYear"
						name="vehicleYear"
						type="number"
						label={fields.vehicleYear.label}
						optionalLabel={optional}
						error={state.errors?.vehicleYear?.[0]}
						defaultValue={defaultValues?.vehicleYear}
					/>
					<Field
						id="vehicleColor"
						name="vehicleColor"
						label={fields.vehicleColor.label}
						optionalLabel={optional}
						error={state.errors?.vehicleColor?.[0]}
						defaultValue={defaultValues?.vehicleColor}
					/>
				</div>
				<Field
					id="licensePlate"
					name="licensePlate"
					label={fields.licensePlate.label}
					optionalLabel={optional}
					error={state.errors?.licensePlate?.[0]}
					defaultValue={defaultValues?.licensePlate}
				/>
				<FormError message={state.message} />
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
