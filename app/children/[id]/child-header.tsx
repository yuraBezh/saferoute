import { InitialsAvatar } from '@/components/ui/initials-avatar';
import { ChildActions } from './child-actions';
import { getAge } from '@/lib/children/get-age';

export function ChildHeader({
	id,
	firstName,
	lastName,
	birthDate,
}: {
	id: string;
	firstName: string;
	lastName: string;
	birthDate: Date;
}) {
	const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();

	return (
		<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex min-w-0 items-center gap-4">
				<InitialsAvatar initials={initials} />
				<div className="min-w-0">
					<h1 className="truncate text-xl font-bold tracking-tight text-gray-950">
						{firstName} {lastName}
					</h1>
					<p className="mt-0.5 text-sm font-medium text-gray-500">
						{getAge(birthDate)} years old
					</p>
				</div>
			</div>

			<ChildActions childId={id} />
		</div>
	);
}
