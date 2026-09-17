import type { ComponentProps, ReactNode } from 'react';
import { Input } from '@/components/ui/input';

type FieldProps = ComponentProps<typeof Input> & {
	id: string;
	label: ReactNode;
	labelAccessory?: ReactNode;
	optionalLabel?: string;
	error?: string;
};

export function Field({
	id,
	label,
	labelAccessory,
	optionalLabel,
	error,
	...inputProps
}: FieldProps) {
	const errorId = `${id}-error`;

	return (
		<div>
			<div className="mb-1.5 flex items-center gap-1.5">
				<label className="text-sm font-medium text-gray-800" htmlFor={id}>
					{label}
					{optionalLabel && <span className="ml-1 font-normal text-gray-500">{optionalLabel}</span>}
				</label>
				{labelAccessory}
			</div>
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
