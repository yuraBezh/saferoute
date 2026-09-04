'use client';

import { useActionState, useState, type ChangeEvent } from 'react';
import type { BookingFormState } from '@/app/bookings/actions';
import { LocationSelect } from '@/components/location-select';
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
	date: string;
	time: string;
	estimatedDurationMin: string;
	notes: string;
};

const EMPTY_VALUES: BookingFormValues = {
	childId: '',
	date: '',
	time: '',
	estimatedDurationMin: '45',
	notes: '',
};

const { fields, optional, cancel, submit, submitting } = bookingFormText;

type BookingFormProps = {
	action: (state: BookingFormState, formData: FormData) => Promise<BookingFormState>;
	childOptions: ChildOption[];
	locations: Option[];
};

export function BookingForm({ action: formAction, childOptions, locations }: BookingFormProps) {
	const initialState: BookingFormState = { message: '', errors: {} };
	const [formState, action, isPending] = useActionState(formAction, initialState);
	const [values, setValues] = useState(EMPTY_VALUES);
	const { childId, date, time, estimatedDurationMin, notes } = values;
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
			<div className="space-y-5 p-5 sm:p-6">
				<SelectField
					id="childId"
					label={fields.childId.label}
					error={formState.errors?.childId?.[0]}
					name="childId"
					required
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

				<div className="grid gap-5 sm:grid-cols-2">
					<Field
						id="date"
						label={fields.date.label}
						error={formState.errors?.date?.[0]}
						name="date"
						type="date"
						required
						value={date}
						onChange={updateValue('date')}
					/>
					<Field
						id="time"
						label={fields.time.label}
						error={formState.errors?.time?.[0]}
						name="time"
						type="time"
						required
						value={time}
						onChange={updateValue('time')}
					/>
				</div>

				<LocationSelect
					name="pickupLocationId"
					label={fields.pickupLocationId.label}
					locations={locations}
					error={formState.errors?.pickupLocationId?.[0]}
					required
				/>
				<LocationSelect
					name="activityLocationId"
					label={fields.activityLocationId.label}
					locations={locations}
					error={formState.errors?.activityLocationId?.[0]}
					required={false}
				/>
				<LocationSelect
					name="dropoffLocationId"
					label={fields.dropoffLocationId.label}
					locations={locations}
					error={formState.errors?.dropoffLocationId?.[0]}
					required
				/>

				<SelectField
					id="estimatedDurationMin"
					label={fields.estimatedDurationMin.label}
					error={formState.errors?.estimatedDurationMin?.[0]}
					name="estimatedDurationMin"
					required
					value={estimatedDurationMin}
					onChange={updateValue('estimatedDurationMin')}
				>
					{fields.estimatedDurationMin.options.map(({ value, label }) => (
						<option key={value} value={value}>
							{label}
						</option>
					))}
				</SelectField>
				<div>
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
