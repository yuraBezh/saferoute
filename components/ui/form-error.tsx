type FormErrorProps = {
	message?: string;
};

export function FormError({ message }: FormErrorProps) {
	if (!message) return null;

	return (
		<p
			className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
			aria-live="polite"
		>
			{message}
		</p>
	);
}
