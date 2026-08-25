import Link from 'next/link';
import { createLocationAction } from '@/app/locations/actions';
import { LocationForm } from '@/components/location-form';
import { ArrowLeftIcon } from '@/components/ui/icons';
import { PageTitle } from '@/components/ui/page-title';
import { createLocationFormText } from '@/lib/content/location-form-text';
import { locationsText } from '@/lib/content/locations-text';

export default function NewLocationPage() {
	const { title, description, submit } = createLocationFormText;

	return (
		<main className="min-h-screen bg-white py-8 text-gray-950">
			<div className="mx-auto w-full max-w-2xl px-6">
				<Link
					href="/locations"
					className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-950"
				>
					<ArrowLeftIcon />
					{locationsText.title}
				</Link>

				<header className="mb-5">
					<PageTitle>{title}</PageTitle>
					<p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
				</header>

				<LocationForm
					action={createLocationAction}
					submitLabel={submit}
					cancelHref="/locations"
				/>
			</div>
		</main>
	);
}
