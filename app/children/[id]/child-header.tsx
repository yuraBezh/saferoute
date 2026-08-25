import { deleteChildAction } from '@/app/children/actions';
import { DeleteButton } from '@/components/ui/delete-button';
import { EditLink } from '@/components/ui/edit-link';
import { InitialsAvatar } from '@/components/ui/initials-avatar';
import { getAge } from '@/lib/children/get-age';
import childDetailsText from '@/lib/content/child-details-text';
import { childrenText } from '@/lib/content/children-text';

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
	const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
	const { actions, deleteModal } = childDetailsText;

	return (
		<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex min-w-0 items-center gap-4">
				<InitialsAvatar initials={initials} />
				<div className="min-w-0">
					<h1 className="truncate text-xl font-bold tracking-tight text-gray-950">
						{firstName} {lastName}
					</h1>
					<p className="mt-0.5 text-sm font-medium text-gray-500">
						{getAge(birthDate)} {childrenText.yearsOld}
					</p>
				</div>
			</div>

			<div className="flex gap-3">
				<EditLink href={`/children/${id}/edit`} label={actions.edit} />
				<DeleteButton
					itemId={id}
					deleteAction={deleteChildAction}
					text={{ trigger: actions.delete, ...deleteModal }}
				/>
			</div>
		</div>
	);
}
