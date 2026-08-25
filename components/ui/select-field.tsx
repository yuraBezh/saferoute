import type { ComponentProps } from 'react';
import { FORM_CONTROL_CLASS_NAME } from '@/components/ui/form-control';
import { ChevronDownIcon } from '@/components/ui/icons';

type SelectFieldProps = Omit<ComponentProps<'select'>, 'className'> & {
	id: string;
	label: string;
	error?: string;
};

export function SelectField({
	id,
	label,
	error,
	children,
	...selectProps
}: SelectFieldProps) {
	const errorId = `${id}-error`;

	return (
		<div>
			<label
				className="mb-1.5 block text-sm font-medium text-gray-800"
				htmlFor={id}
			>
				{label}
			</label>
			<div className="relative">
				<select
					{...selectProps}
					id={id}
					aria-describedby={error ? errorId : undefined}
					aria-invalid={Boolean(error)}
					className={`${FORM_CONTROL_CLASS_NAME} appearance-none pr-10`}
				>
					{children}
				</select>
				<span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500">
					<ChevronDownIcon />
				</span>
			</div>
			{error && (
				<p id={errorId} className="mt-1.5 text-sm text-red-600">
					{error}
				</p>
			)}
		</div>
	);
}
