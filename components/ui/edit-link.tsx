import Link from 'next/link';
import { EditIcon } from '@/components/ui/icons';

export function EditLink({ href, label }: { href: string; label: string }) {
	return (
		<Link
			href={href}
			className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
		>
			<EditIcon />
			{label}
		</Link>
	);
}
