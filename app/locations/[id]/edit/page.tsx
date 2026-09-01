import { notFound } from 'next/navigation';
import {
	deleteLocationAction,
	editLocationAction,
} from '@/app/locations/actions';
import { LocationForm } from '@/components/location-form';
import { BackLink } from '@/components/ui/back-link';
import { DeleteButton } from '@/components/ui/delete-button';
import { PageTitle } from '@/components/ui/page-title';
import { editLocationFormText } from '@/lib/content/location-form-text';
import { locationsText } from '@/lib/content/locations-text';
import { getOwnedLocation } from '@/lib/data/locations';

export default async function EditLocationPage({
	params,
}: PageProps<'/locations/[id]/edit'>) {
	const { id } = await params;
	const location = await getOwnedLocation(id);

	if (!location) notFound();

	const action = editLocationAction.bind(null, location.id);
	const defaultValues = {
		type: location.type,
		name: location.name,
		addressLine1: location.addressLine1,
		addressLine2: location.addressLine2 ?? '',
		city: location.city,
		state: location.state,
		postalCode: location.postalCode,
	};

	return (
		<main className="min-h-screen bg-white py-8 text-gray-950">
			<div className="mx-auto w-full max-w-2xl px-6">
				<BackLink href="/locations" className="mb-5">
					{locationsText.title}
				</BackLink>

				<header className="mb-5">
					<PageTitle>{editLocationFormText.title}</PageTitle>
					<p className="mt-1 text-sm leading-6 text-gray-600">
						{editLocationFormText.description(location.name)}
					</p>
				</header>

				<LocationForm
					action={action}
					defaultValues={defaultValues}
					submitLabel={editLocationFormText.submit}
					cancelHref="/locations"
					footerAction={
						<DeleteButton
							itemId={location.id}
							deleteAction={deleteLocationAction}
							text={editLocationFormText.delete}
						/>
					}
				/>
			</div>
		</main>
	);
}
