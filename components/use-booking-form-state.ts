import { startTransition, useActionState, useState, type SubmitEvent } from 'react';
import type { BookingFormState } from '@/app/bookings/actions';
import { bookingFormText } from '@/lib/content/booking-form-text';

export type BookingFormValues = {
	childId: string;
	date: string;
	time: string;
	pickupLocationId: string;
	activityLocationId: string;
	dropoffLocationId: string;
	estimatedDurationMin: string;
	notes: string;
};

type BookingField = keyof BookingFormValues;

type UseBookingFormStateProps = {
	formAction: (state: BookingFormState, formData: FormData) => Promise<BookingFormState>;
};

const { validationError } = bookingFormText;
const defaultValues: BookingFormValues = {
	childId: '',
	date: '',
	time: '',
	pickupLocationId: '',
	activityLocationId: '',
	dropoffLocationId: '',
	estimatedDurationMin: '45',
	notes: '',
};
const initialState: BookingFormState = { message: '', errors: {} };

export function useBookingFormState({ formAction }: UseBookingFormStateProps) {
	const [formState, action, isPending] = useActionState(formAction, initialState);
	const { errors, message } = formState;
	const [values, setValues] = useState(defaultValues);
	const [changedFields, setChangedFields] = useState<Set<BookingField>>(() => new Set());

	const updateValue = (field: BookingField, value: string) => {
		setValues((current) => ({ ...current, [field]: value }));
		setChangedFields((current) => new Set(current).add(field));
	};
	const getFieldError = (field: BookingField) =>
		isPending || changedFields.has(field) ? undefined : errors?.[field]?.[0];
	const formMessage =
		isPending || (message === validationError && changedFields.size > 0) ? undefined : message;
	const submitForm = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		setChangedFields(new Set());
		startTransition(() => action(formData));
	};

	return { action, formMessage, getFieldError, isPending, submitForm, updateValue, values };
}
