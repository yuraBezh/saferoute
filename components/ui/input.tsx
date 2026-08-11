import type { ComponentProps } from 'react';

export function Input({ className, ...props }: ComponentProps<'input'>) {
	return (
		<input
			className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 aria-invalid:border-red-500 aria-invalid:focus:border-red-500 aria-invalid:focus:ring-red-100 ${className ?? ''}`.trim()}
			{...props}
		/>
	);
}
