import type { ComponentProps } from 'react';

const baseClasses =
	'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed';

const variantClasses = {
	primary:
		'bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:outline-blue-600 disabled:bg-blue-300',
	secondary:
		'border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus-visible:outline-blue-600 disabled:opacity-50',
	danger:
		'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600 disabled:opacity-50',
} as const;

type ButtonVariant = keyof typeof variantClasses;

type ButtonProps = ComponentProps<'button'> & {
	variant?: ButtonVariant;
};

export function Button({
	className,
	type = 'button',
	variant = 'primary',
	...props
}: ButtonProps) {
	return (
		<button
			{...props}
			type={type}
			className={`${baseClasses} ${variantClasses[variant]} ${className ?? ''}`}
		/>
	);
}
