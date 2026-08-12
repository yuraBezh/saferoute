import Link from 'next/link';
import { DeleteIcon, EditIcon } from './action-icons';

const actionClassName =
	'inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition sm:flex-none';

export function ChildActions({ childId }: { childId: string }) {
	return (
		<div className="flex gap-3 sm:shrink-0">
			<Link
				href={`/children/${childId}/edit`}
				className={`${actionClassName} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`}
			>
				<EditIcon />
				Edit
			</Link>

			<button
				type="button"
				className={`${actionClassName} bg-red-600 text-white hover:bg-red-500`}
			>
				<DeleteIcon />
				Delete
			</button>
		</div>
	);
}
