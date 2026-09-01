import { createLocationAction } from '@/app/locations/actions';
import { LocationForm } from '@/components/location-form';
import { BackLink } from '@/components/ui/back-link';
import { PageTitle } from '@/components/ui/page-title';
import { createLocationFormText } from '@/lib/content/location-form-text';
import { locationsText } from '@/lib/content/locations-text';

export default function NewLocationPage() {
	const { title, description, submit } = createLocationFormText;

	return (
		<main className="min-h-screen bg-white py-8 text-gray-950">
			<div className="mx-auto w-full max-w-2xl px-6">
				<BackLink href="/locations" className="mb-5">
					{locationsText.title}
				</BackLink>

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
