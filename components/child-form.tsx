'use client';

import { useActionState, useState } from 'react';
import { type ChildFormState } from '@/app/children/actions';
import { childFormText } from '@/lib/content/child-form-text';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import Link from 'next/link';

const {
	cancel,
	fields: {
		firstName: firstNameText,
		lastName: lastNameText,
		birthDate: birthDateText,
	},
} = childFormText;

type ChildFormProps = {
	formAction: (
		state: ChildFormState,
		formData: FormData,
	) => Promise<ChildFormState>;
	defaultValues?: { firstName: string; lastName: string; birthDate: string };
	submitLabel: string;
	submittingLabel: string;
	cancelHref?: string;
};

export function ChildForm(props: ChildFormProps) {
	const {
		formAction,
		defaultValues,
		submitLabel,
		submittingLabel,
		cancelHref,
	} = props;

	const initialState: ChildFormState = { message: '', errors: {} };
	const [formState, action, isPending] = useActionState(
		formAction,
		initialState,
	);
	const [values, setValues] = useState(
		defaultValues ?? {
			firstName: '',
			lastName: '',
			birthDate: '',
		},
	);

	return (
		<div className="w-full">
			<form
				action={action}
				noValidate
				className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
			>
				<div className="space-y-5">
					<Field
						id="firstName"
						label={firstNameText.label}
						error={formState.errors?.firstName?.[0]}
						name="firstName"
						value={values.firstName}
						onChange={(event) =>
							setValues({ ...values, firstName: event.target.value })
						}
						autoComplete="given-name"
					/>

					<Field
						id="lastName"
						label={lastNameText.label}
						error={formState.errors?.lastName?.[0]}
						name="lastName"
						value={values.lastName}
						onChange={(event) =>
							setValues({ ...values, lastName: event.target.value })
						}
						autoComplete="family-name"
					/>

					<Field
						id="birthDate"
						label={birthDateText.label}
						error={formState.errors?.birthDate?.[0]}
						type="date"
						name="birthDate"
						value={values.birthDate}
						onChange={(event) =>
							setValues({ ...values, birthDate: event.target.value })
						}
						required
					/>

					{formState.message && (
						<p
							className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
							aria-live="polite"
						>
							{formState.message}
						</p>
					)}

					<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
						{cancelHref && (
							<Link
								href={cancelHref}
								className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
							>
								{cancel}
							</Link>
						)}
						<Button type="submit" disabled={isPending}>
							{isPending ? submittingLabel : submitLabel}
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
