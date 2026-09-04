import { createBookingAction } from '@/app/bookings/actions';
import { BookingForm } from '@/components/booking-form';
import { BackLink } from '@/components/ui/back-link';
import { PageContainer } from '@/components/ui/page-container';
import { PageDescription } from '@/components/ui/page-description';
import { PageTitle } from '@/components/ui/page-title';
import { bookingFormText } from '@/lib/content/booking-form-text';
import { bookingsText } from '@/lib/content/bookings-text';
import { getBookableChildrenForCurrentUser } from '@/lib/data/bookings';
import { getLocationsForCurrentUser } from '@/lib/data/locations';

export default async function NewBookingPage() {
	const [children, locations] = await Promise.all([
		getBookableChildrenForCurrentUser(),
		getLocationsForCurrentUser(),
	]);

	return (
		<PageContainer size="form">
			<BackLink href="/bookings" className="mb-5">
				{bookingsText.title}
			</BackLink>
			<header className="mb-5">
				<PageTitle>{bookingFormText.title}</PageTitle>
				<PageDescription>{bookingFormText.description}</PageDescription>
			</header>
			<BookingForm
				action={createBookingAction}
				childOptions={children}
				locations={locations.map(({ id, name }) => ({ id, name }))}
			/>
		</PageContainer>
	);
}
