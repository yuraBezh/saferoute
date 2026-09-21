import { startTransition, useActionState, useState, type SubmitEvent } from 'react';
import type { CaregiverFormState } from '@/app/caregiver/actions';
import { caregiverText } from '@/lib/content/caregiver-text';
import type { CaregiverFormValues } from '@/lib/validation/caregiver';

type CaregiverField = keyof CaregiverFormValues;

type UseCaregiverFormStateProps = {
	formAction: (state: CaregiverFormState, formData: FormData) => Promise<CaregiverFormState>;
	preFillValue?: CaregiverFormValues;
};

const { validationError } = caregiverText;
const defaultValues: CaregiverFormValues = {
	bio: '',
	hourlyRate: '',
	vehicleMake: '',
	vehicleModel: '',
	vehicleYear: '',
	vehicleColor: '',
	licensePlate: '',
};
const initialState: CaregiverFormState = { message: '', errors: {} };

export function useCaregiverFormState({ formAction, preFillValue }: UseCaregiverFormStateProps) {
	const [formState, action, isPending] = useActionState(formAction, initialState);
	const { errors, message } = formState;
	const [values, setValues] = useState({ ...defaultValues, ...preFillValue });
	const [changedFields, setChangedFields] = useState<Set<CaregiverField>>(() => new Set());

	const updateValue = (field: CaregiverField, value: string) => {
		setValues((current) => ({ ...current, [field]: value }));
		setChangedFields((current) => new Set(current).add(field));
	};
	const getFieldError = (field: CaregiverField) =>
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
