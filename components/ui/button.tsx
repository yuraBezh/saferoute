import type { ComponentProps } from 'react';

const baseClasses =
	'inline-flex cursor-pointer items-center justify-center gap-2 text-sm transition focus-visible:outline-2 disabled:cursor-not-allowed';

const variantClasses = {
	primary:
		'rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-blue-600 focus-visible:outline-offset-2 disabled:bg-blue-300',
	secondary:
		'rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-800 shadow-sm hover:bg-gray-50 focus-visible:outline-blue-600 focus-visible:outline-offset-2 disabled:opacity-50',
	danger:
		'rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-500 focus-visible:outline-red-600 focus-visible:outline-offset-2 disabled:opacity-50',
	landingPrimary:
		'min-h-12 rounded-full bg-[#155eef] px-6 font-bold text-white shadow-[0_10px_30px_rgba(21,94,239,0.22)] hover:bg-[#084dcc] focus-visible:outline-[#155eef] focus-visible:outline-offset-4 disabled:opacity-50',
	landingSecondary:
		'min-h-12 rounded-full border border-[#a9bed1] bg-white px-6 font-bold text-[#173a5e] hover:border-[#6486a4] hover:bg-[#edf6ff] focus-visible:outline-[#155eef] focus-visible:outline-offset-4 disabled:opacity-50',
	landingAccent:
		'min-h-12 rounded-full bg-[#ffcf5c] px-6 font-bold text-[#10253f] hover:bg-[#ffda7f] focus-visible:outline-[#ffcf5c] focus-visible:outline-offset-4 disabled:opacity-50',
} as const;

type ButtonVariant = keyof typeof variantClasses;

type ButtonProps = ComponentProps<'button'> & {
	variant?: ButtonVariant;
};

export const Button = ({
	className,
	type = 'button',
	variant = 'primary',
	...props
}: ButtonProps) => (
	<button
		{...props}
		type={type}
		className={`${baseClasses} ${variantClasses[variant]} ${className ?? ''}`}
	/>
);
