'use client';

import { useActionState, useState, type ChangeEvent } from 'react';
import type { BookingFormState } from '@/app/bookings/actions';
import { Field } from '@/components/ui/field';
import { FORM_CONTROL_CLASS_NAME } from '@/components/ui/form-control';
import { FormActions } from '@/components/ui/form-actions';
import { FormError } from '@/components/ui/form-error';
import { SelectField } from '@/components/ui/select-field';
import { bookingFormText } from '@/lib/content/booking-form-text';

type Option = { id: string; name: string };
type ChildOption = { id: string; firstName: string; lastName: string };
type BookingFormValues = {
	childId: string;
	pickupLocationId: string;
	activityLocationId: string;
	dropoffLocationId: string;
	date: string;
	time: string;
	estimatedDurationMin: string;
	notes: string;
};

const EMPTY_VALUES: BookingFormValues = {
	childId: '',
	pickupLocationId: '',
	activityLocationId: '',
	dropoffLocationId: '',
	date: '',
	time: '',
	estimatedDurationMin: '45',
	notes: '',
};

const { fields, optional, cancel, submit, submitting } = bookingFormText;

export function BookingForm({
	action: formAction,
	childOptions,
	locations,
}: {
	action: (state: BookingFormState, formData: FormData) => Promise<BookingFormState>;
	childOptions: ChildOption[];
	locations: Option[];
}) {
	const initialState: BookingFormState = { message: '', errors: {} };
	const [formState, action, isPending] = useActionState(formAction, initialState);
	const [values, setValues] = useState(EMPTY_VALUES);
	const {
		childId,
		pickupLocationId,
		activityLocationId,
		dropoffLocationId,
		date,
		time,
		estimatedDurationMin,
		notes,
	} = values;
	const updateValue =
		(field: keyof BookingFormValues) =>
		(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
			setValues((current) => ({ ...current, [field]: event.target.value }));

	return (
		<form
			action={action}
			noValidate
			className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
		>
			<div className="border-b border-gray-200 p-5 sm:p-6">
				<h2 className="text-sm font-semibold tracking-wide text-gray-950 uppercase">Route</h2>
				<div className="mt-4 grid gap-5 sm:grid-cols-2">
					<SelectField
						id="childId"
						label={fields.childId.label}
						error={formState.errors?.childId?.[0]}
						name="childId"
						value={childId}
						onChange={updateValue('childId')}
					>
						<option value="">{fields.childId.placeholder}</option>
						{childOptions.map(({ id, firstName, lastName }) => (
							<option key={id} value={id}>
								{firstName} {lastName}
							</option>
						))}
					</SelectField>
					<div className="hidden sm:block" />
					<SelectField
						id="pickupLocationId"
						label={fields.pickupLocationId.label}
						error={formState.errors?.pickupLocationId?.[0]}
						name="pickupLocationId"
						value={pickupLocationId}
						onChange={updateValue('pickupLocationId')}
					>
						<option value="">{fields.pickupLocationId.placeholder}</option>
						{locations.map(({ id, name }) => (
							<option key={id} value={id}>
								{name}
							</option>
						))}
					</SelectField>
					<SelectField
						id="activityLocationId"
						label={fields.activityLocationId.label}
						optionalLabel={optional}
						error={formState.errors?.activityLocationId?.[0]}
						name="activityLocationId"
						value={activityLocationId}
						onChange={updateValue('activityLocationId')}
					>
						<option value="">{fields.activityLocationId.placeholder}</option>
						{locations.map(({ id, name }) => (
							<option key={id} value={id}>
								{name}
							</option>
						))}
					</SelectField>
					<SelectField
						id="dropoffLocationId"
						label={fields.dropoffLocationId.label}
						error={formState.errors?.dropoffLocationId?.[0]}
						name="dropoffLocationId"
						value={dropoffLocationId}
						onChange={updateValue('dropoffLocationId')}
					>
						<option value="">{fields.dropoffLocationId.placeholder}</option>
						{locations.map(({ id, name }) => (
							<option key={id} value={id}>
								{name}
							</option>
						))}
					</SelectField>
				</div>
			</div>

			<div className="p-5 sm:p-6">
				<h2 className="text-sm font-semibold tracking-wide text-gray-950 uppercase">Schedule</h2>
				<div className="mt-4 grid gap-5 sm:grid-cols-3">
					<Field
						id="date"
						label={fields.date.label}
						error={formState.errors?.date?.[0]}
						name="date"
						type="date"
						value={date}
						onChange={updateValue('date')}
					/>
					<Field
						id="time"
						label={fields.time.label}
						error={formState.errors?.time?.[0]}
						name="time"
						type="time"
						value={time}
						onChange={updateValue('time')}
					/>
					<Field
						id="estimatedDurationMin"
						label={fields.estimatedDurationMin.label}
						error={formState.errors?.estimatedDurationMin?.[0]}
						name="estimatedDurationMin"
						type="number"
						min={15}
						max={480}
						step={15}
						value={estimatedDurationMin}
						onChange={updateValue('estimatedDurationMin')}
					/>
				</div>
				<div className="mt-5">
					<label className="mb-1.5 block text-sm font-medium text-gray-800" htmlFor="notes">
						{fields.notes.label} <span className="font-normal text-gray-500">{optional}</span>
					</label>
					<textarea
						id="notes"
						name="notes"
						rows={4}
						maxLength={500}
						placeholder={fields.notes.placeholder}
						value={notes}
						onChange={updateValue('notes')}
						aria-invalid={Boolean(formState.errors?.notes?.[0])}
						aria-describedby={formState.errors?.notes?.[0] ? 'notes-error' : undefined}
						className={`${FORM_CONTROL_CLASS_NAME} resize-y placeholder:text-gray-400`}
					/>
					{formState.errors?.notes?.[0] ? (
						<p id="notes-error" className="mt-1.5 text-sm text-red-600">
							{formState.errors.notes[0]}
						</p>
					) : null}
				</div>
				<FormError message={formState.message} />
				<FormActions
					cancelHref="/bookings"
					cancelLabel={cancel}
					isPending={isPending}
					submitLabel={submit}
					submittingLabel={submitting}
				/>
			</div>
		</form>
	);
}
