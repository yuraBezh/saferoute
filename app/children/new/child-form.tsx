'use client';

import { useActionState, useState } from 'react';
import { childFormAction, type ChildFormState } from '@/app/children/actions';
import { childFormText } from '@/lib/children/child-form-text';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { PageTitle } from '@/components/ui/page-title';
const {
	title,
	description,
	submit,
	submitting,
	fields: {
		firstName: firstNameText,
		lastName: lastNameText,
		birthDate: birthDateText,
	},
} = childFormText;

export function ChildForm() {
	const initialState: ChildFormState = { message: '', errors: {} };
	const [formState, action, isPending] = useActionState(
		childFormAction,
		initialState,
	);
	const [values, setValues] = useState({
		firstName: '',
		lastName: '',
		birthDate: '',
	});

	return (
		<main className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
			<form
				action={action}
				noValidate
				className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
			>
				<div className="mb-7">
					<PageTitle>{title}</PageTitle>
					<p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
				</div>

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

					<Button type="submit" disabled={isPending}>
						{isPending ? submitting : submit}
					</Button>
				</div>
			</form>
		</main>
	);
}
