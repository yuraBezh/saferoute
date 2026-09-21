'use client';

import type { BookingFormState } from '@/app/bookings/actions';
import { LocationSelect } from '@/components/location-select';
import { Field } from '@/components/ui/field';
import { FORM_CONTROL_CLASS_NAME } from '@/components/ui/form-control';
import { FormActions } from '@/components/ui/form-actions';
import { FormError } from '@/components/ui/form-error';
import { SelectField } from '@/components/ui/select-field';
import { useBookingFormState } from '@/components/use-booking-form-state';
import { bookingFormText } from '@/lib/content/booking-form-text';

type Option = { id: string; name: string };
type ChildOption = { id: string; firstName: string; lastName: string };
const { fields, optional, cancel, submit, submitting } = bookingFormText;

type BookingFormProps = {
	action: (state: BookingFormState, formData: FormData) => Promise<BookingFormState>;
	childOptions: ChildOption[];
	locations: Option[];
};

export function BookingForm({ action: formAction, childOptions, locations }: BookingFormProps) {
	const { action, formMessage, getFieldError, isPending, submitForm, updateValue, values } =
		useBookingFormState({ formAction });
	const { childId, date, time, estimatedDurationMin, notes } = values;

	return (
		<form
			action={action}
			onSubmit={submitForm}
			noValidate
			className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
		>
			<div className="space-y-5 p-5 sm:p-6">
				<SelectField
					id="childId"
					label={fields.childId.label}
					error={getFieldError('childId')}
					name="childId"
					required
					value={childId}
					onChange={(e) => updateValue('childId', e.target.value)}
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
						error={getFieldError('date')}
						name="date"
						type="date"
						required
						value={date}
						onChange={(e) => updateValue('date', e.target.value)}
					/>
					<Field
						id="time"
						label={fields.time.label}
						error={getFieldError('time')}
						name="time"
						type="time"
						required
						value={time}
						onChange={(e) => updateValue('time', e.target.value)}
					/>
				</div>
				<LocationSelect
					name="pickupLocationId"
					label={fields.pickupLocationId.label}
					locations={locations}
					error={getFieldError('pickupLocationId')}
					required
					value={values.pickupLocationId}
					onChangeAction={(e) => updateValue('pickupLocationId', e.target.value)}
				/>
				<LocationSelect
					name="activityLocationId"
					label={fields.activityLocationId.label}
					locations={locations}
					error={getFieldError('activityLocationId')}
					required={false}
					value={values.activityLocationId}
					onChangeAction={(e) => updateValue('activityLocationId', e.target.value)}
				/>
				<LocationSelect
					name="dropoffLocationId"
					label={fields.dropoffLocationId.label}
					locations={locations}
					error={getFieldError('dropoffLocationId')}
					required
					value={values.dropoffLocationId}
					onChangeAction={(e) => updateValue('dropoffLocationId', e.target.value)}
				/>
				<SelectField
					id="estimatedDurationMin"
					label={fields.estimatedDurationMin.label}
					error={getFieldError('estimatedDurationMin')}
					name="estimatedDurationMin"
					required
					value={estimatedDurationMin}
					onChange={(e) => updateValue('estimatedDurationMin', e.target.value)}
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
						onChange={(e) => updateValue('notes', e.target.value)}
						aria-invalid={Boolean(getFieldError('notes'))}
						aria-describedby={getFieldError('notes') ? 'notes-error' : undefined}
						className={`${FORM_CONTROL_CLASS_NAME} resize-y placeholder:text-gray-400`}
					/>
					{getFieldError('notes') ? (
						<p id="notes-error" className="mt-1.5 text-sm text-red-600">
							{getFieldError('notes')}
						</p>
					) : null}
				</div>
				<FormError message={formMessage} />
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
