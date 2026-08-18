import Link from 'next/link';
import { PlusIcon } from '@/components/ui/icons';
import { locationsText } from '@/lib/content/locations-text';

export function LocationsEmptyState() {
	const { title, description, cta } = locationsText.empty;

	return (
		<div className="rounded-xl border border-dashed border-gray-300 px-6 py-14 text-center">
			<h2 className="text-lg font-semibold text-gray-950">{title}</h2>
			<p className="mt-1 text-sm text-gray-500">{description}</p>
			<Link
				href="/locations/new"
				className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
			>
				<PlusIcon />
				{cta}
			</Link>
		</div>
	);
}
