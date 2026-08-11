import type { ComponentProps } from 'react';
import { Input } from '@/components/ui/input';

type FieldProps = ComponentProps<typeof Input> & {
	id: string;
	label: string;
	error?: string;
};

export function Field({ id, label, error, ...inputProps }: FieldProps) {
	const errorId = `${id}-error`;

	return (
		<div>
			<label className="mb-1.5 block text-sm font-medium text-gray-800" htmlFor={id}>
				{label}
			</label>
			<Input
				{...inputProps}
				id={id}
				aria-describedby={error ? errorId : undefined}
				aria-invalid={Boolean(error)}
			/>
			{error && (
				<p id={errorId} className="mt-1.5 text-sm text-red-600">
					{error}
				</p>
			)}
		</div>
	);
}
