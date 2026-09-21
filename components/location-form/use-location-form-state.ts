import { startTransition, useActionState, useState, type SubmitEvent } from 'react';
import type { LocationFormState } from '@/app/locations/actions';
import { locationFormText } from '@/lib/content/location-form-text';
import { EMPTY_VALUES, type LocationFormValues } from '@/components/location-form/config';

type LocationField = keyof LocationFormValues;

type UseLocationFormStateProps = {
	formAction: (state: LocationFormState, formData: FormData) => Promise<LocationFormState>;
	preFillValue?: LocationFormValues;
};

const { validationError } = locationFormText;

export function useLocationFormState({ formAction, preFillValue }: UseLocationFormStateProps) {
	const initialState: LocationFormState = { message: '', errors: {} };
	const [formState, action, isPending] = useActionState(formAction, initialState);
	const { errors, message } = formState;
	const [values, setValues] = useState<LocationFormValues>({
		...EMPTY_VALUES,
		...preFillValue,
	});
	const [changedFields, setChangedFields] = useState<Set<LocationField>>(() => new Set());

	const updateValue = (field: LocationField, value: string) => {
		setValues((current) => ({ ...current, [field]: value }));
		setChangedFields((current) => new Set(current).add(field));
	};
	const getFieldError = (field: LocationField) =>
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
