export function InitialsAvatar({ initials }: { initials: string }) {
	return (
		<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
			{initials}
		</div>
	);
}
