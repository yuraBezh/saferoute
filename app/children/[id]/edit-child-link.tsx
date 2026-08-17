import Link from 'next/link';
import { EditIcon } from '@/components/ui/icons';
import childDetailsText from '@/lib/content/child-details-text';

export function EditChildLink({ childId }: { childId: string }) {
	return (
		<Link
			href={`/children/${childId}/edit`}
			className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
		>
			<EditIcon />
			{childDetailsText.actions.edit}
		</Link>
	);
}
