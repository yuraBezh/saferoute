'use client';

import { type ChildFormState } from '@/app/children/actions';
import { childFormText } from '@/lib/content/child-form-text';
import { Field } from '@/components/ui/field';
import { FormActions } from '@/components/ui/form-actions';
import { FormError } from '@/components/ui/form-error';
import { RelationshipField } from '@/components/relationship-field';
import { useChildFormState } from '@/components/use-child-form-state';

const {
	cancel,
	fields: { firstName: firstNameText, lastName: lastNameText, birthDate: birthDateText },
} = childFormText;

export type ChildFormProps = {
	formAction: (state: ChildFormState, formData: FormData) => Promise<ChildFormState>;
	preFillValue?: { firstName: string; lastName: string; birthDate: string };
	submitLabel: string;
	submittingLabel: string;
	cancelHref?: string;
	showRelationship?: boolean;
};

export function ChildForm(props: ChildFormProps) {
	const {
		formAction,
		preFillValue,
		submitLabel,
		submittingLabel,
		cancelHref,
		showRelationship = false,
	} = props;

	const { action, formMessage, getFieldError, isPending, submitForm, updateValue, values } =
		useChildFormState({ formAction, preFillValue });

	return (
		<div className="w-full">
			<form
				action={action}
				onSubmit={submitForm}
				noValidate
				className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
			>
				<div className="space-y-5">
					<Field
						id="firstName"
						label={firstNameText.label}
						error={getFieldError('firstName')}
						name="firstName"
						value={values.firstName}
						onChange={(e) => updateValue('firstName', e.target.value)}
						autoComplete="given-name"
					/>
					<Field
						id="lastName"
						label={lastNameText.label}
						error={getFieldError('lastName')}
						name="lastName"
						value={values.lastName}
						onChange={(e) => updateValue('lastName', e.target.value)}
						autoComplete="family-name"
					/>
					<Field
						id="birthDate"
						label={birthDateText.label}
						error={getFieldError('birthDate')}
						type="date"
						name="birthDate"
						value={values.birthDate}
						onChange={(e) => updateValue('birthDate', e.target.value)}
						required
					/>
					{showRelationship && (
						<RelationshipField
							error={getFieldError('relationship')}
							value={values.relationship}
							onChange={(e) => updateValue('relationship', e.target.value)}
						/>
					)}
					<FormError message={formMessage} />
					<FormActions
						cancelHref={cancelHref}
						cancelLabel={cancel}
						isPending={isPending}
						submitLabel={submitLabel}
						submittingLabel={submittingLabel}
					/>
				</div>
			</form>
		</div>
	);
}
