import { createLocationAction } from '@/app/locations/actions';
import { LocationForm } from '@/components/location-form';
import { BackLink } from '@/components/ui/back-link';
import { PageTitle } from '@/components/ui/page-title';
import { PageDescription } from '@/components/ui/page-description';
import { PageContainer } from '@/components/ui/page-container';
import { createLocationFormText } from '@/lib/content/location-form-text';
import { locationsText } from '@/lib/content/locations-text';

export default function NewLocationPage() {
	const { title, description, submit } = createLocationFormText;

	return (
		<PageContainer size="form">
			<BackLink href="/locations" className="mb-5">
				{locationsText.title}
			</BackLink>

			<header className="mb-5">
				<PageTitle>{title}</PageTitle>
				<PageDescription>{description}</PageDescription>
			</header>

			<LocationForm action={createLocationAction} submitLabel={submit} cancelHref="/locations" />
		</PageContainer>
	);
}
