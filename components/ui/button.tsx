import type { ComponentProps } from 'react';

export function Button({ className, ...props }: ComponentProps<'button'>) {
	return (
		<button
			className={`inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300 ${className ?? ''}`.trim()}
			{...props}
		/>
	);
}
