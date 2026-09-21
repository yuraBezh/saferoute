import { startTransition, useActionState, useState, type SubmitEvent } from 'react';
import type { ChildFormState } from '@/app/children/actions';
import { childFormText } from '@/lib/content/child-form-text';

type ChildField = 'firstName' | 'lastName' | 'birthDate' | 'relationship';

type ChildFormValues = {
	firstName: string;
	lastName: string;
	birthDate: string;
	relationship: string;
};

type UseChildFormStateProps = {
	formAction: (state: ChildFormState, formData: FormData) => Promise<ChildFormState>;
	preFillValue?: Omit<ChildFormValues, 'relationship'>;
};

const { validationError } = childFormText;
const defaultValues = {
	firstName: '',
	lastName: '',
	birthDate: '',
} as const;

export function useChildFormState({ formAction, preFillValue }: UseChildFormStateProps) {
	const initialState: ChildFormState = { message: '', errors: {} };
	const [formState, action, isPending] = useActionState(formAction, initialState);
	const { errors, message } = formState;
	const [values, setValues] = useState<ChildFormValues>({
		...defaultValues,
		...preFillValue,
		relationship: '',
	});
	const [changedFields, setChangedFields] = useState<Set<ChildField>>(() => new Set());

	const updateValue = (field: ChildField, value: string) => {
		setValues((current) => ({ ...current, [field]: value }));
		setChangedFields((current) => new Set(current).add(field));
	};

	const getFieldError = (field: ChildField) =>
		isPending || changedFields.has(field) ? undefined : errors?.[field]?.[0];

	const formMessage =
		isPending || (message === validationError && changedFields.size > 0) ? undefined : message;

	const submitForm = (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		setChangedFields(new Set());

		startTransition(() => action(formData));
	};

	return {
		action,
		formMessage,
		getFieldError,
		isPending,
		submitForm,
		updateValue,
		values,
	};
}
