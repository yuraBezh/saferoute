'use client';

import { useActionState, useState } from 'react';
import { childFormAction, type ChildFormState } from '@/app/children/actions';
import { childFormText } from '@/lib/children/child-form-text';

const inputClassName =
	'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 aria-invalid:border-red-500 aria-invalid:focus:border-red-500 aria-invalid:focus:ring-red-100';
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
	const [formState, action, isPending] = useActionState(childFormAction, initialState);
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
					<h1 className="text-2xl font-semibold tracking-tight text-gray-950">
						{title}
					</h1>
					<p className="mt-2 text-sm leading-6 text-gray-600">
						{description}
					</p>
				</div>

				<div className="space-y-5">
					<div>
					<label className="mb-1.5 block text-sm font-medium text-gray-800" htmlFor="firstName">
						{firstNameText.label}
					</label>
					<input
						name="firstName"
						value={values.firstName}
						onChange={(event) => setValues({ ...values, firstName: event.target.value })}
						className={inputClassName}
						id="firstName"
						aria-describedby="firstName-error"
						aria-invalid={Boolean(formState.errors?.firstName)}
						autoComplete="given-name"
					/>
					{formState.errors?.firstName?.[0] && (
						<p id="firstName-error" className="mt-1.5 text-sm text-red-600">
							{formState.errors.firstName[0]}
						</p>
					)}
					</div>

					<div>
					<label className="mb-1.5 block text-sm font-medium text-gray-800" htmlFor="lastName">
						{lastNameText.label}
					</label>
					<input
						name="lastName"
						value={values.lastName}
						onChange={(event) => setValues({ ...values, lastName: event.target.value })}
						className={inputClassName}
						id="lastName"
						aria-describedby="lastName-error"
						aria-invalid={Boolean(formState.errors?.lastName)}
						autoComplete="family-name"
					/>
					{formState.errors?.lastName?.[0] && (
						<p id="lastName-error" className="mt-1.5 text-sm text-red-600">
							{formState.errors.lastName[0]}
						</p>
					)}
					</div>

					<div>
					<label className="mb-1.5 block text-sm font-medium text-gray-800" htmlFor="birthDate">
						{birthDateText.label}
					</label>
					<input
						type="date"
						name="birthDate"
						value={values.birthDate}
						onChange={(event) => setValues({ ...values, birthDate: event.target.value })}
						className={inputClassName}
						id="birthDate"
						aria-describedby="birthDate-error"
						aria-invalid={Boolean(formState.errors?.birthDate)}
						required
					/>
					{formState.errors?.birthDate?.[0] && (
						<p id="birthDate-error" className="mt-1.5 text-sm text-red-600">
							{formState.errors.birthDate[0]}
						</p>
					)}
					</div>

					{formState.message && (
						<p
							className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
							aria-live="polite"
						>
							{formState.message}
						</p>
					)}

					<button
						type="submit"
						disabled={isPending}
						className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
					>
						{isPending ? submitting : submit}
					</button>
				</div>
			</form>
		</main>
	)
}
