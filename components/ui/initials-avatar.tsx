const sizes = {
	sm: 'size-10',
	md: 'size-12',
};

export function InitialsAvatar({
	initials,
	size = 'md',
}: {
	initials: string;
	size?: keyof typeof sizes;
}) {
	return (
		<div
			className={`flex shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 ${sizes[size]}`}
		>
			{initials}
		</div>
	);
}
