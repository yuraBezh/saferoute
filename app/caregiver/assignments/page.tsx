import { CaregiverStatus, UserRole } from '@/generated/prisma/enums';
import { AcceptedBookingCard } from '@/app/caregiver/assignments/accepted-booking-card';
import { AssignmentsSection } from '@/app/caregiver/assignments/assignments-section';
import { AvailableBookingCard } from '@/app/caregiver/assignments/available-booking-card';
import { PageContainer } from '@/components/ui/page-container';
import { PageDescription } from '@/components/ui/page-description';
import { PageTitle } from '@/components/ui/page-title';
import { requireRole } from '@/lib/auth/roles';
import { assignmentsText } from '@/lib/content/assignments-text';
import {
	getAcceptedBookingsForCurrentCaregiver,
	getAvailableBookingsForCurrentCaregiver,
} from '@/lib/data/caregiver-bookings';
import { getCaregiverStatus } from '@/lib/data/caregivers';

const {
	title,
	description,
	availableTitle,
	availableEmpty,
	acceptedTitle,
	acceptedEmpty,
	verificationRequiredTitle,
	notVerifiedError,
} = assignmentsText;

const assignmentsHeader = (
	<header className="mb-8">
		<PageTitle>{title}</PageTitle>
		<PageDescription>{description}</PageDescription>
	</header>
);

export default async function AssignmentsPage() {
	await requireRole(UserRole.CAREGIVER);
	const status = await getCaregiverStatus();

	if (status !== CaregiverStatus.VERIFIED) {
		return (
			<PageContainer>
				{assignmentsHeader}
				<section className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-6">
					<h2 className="font-semibold text-amber-950">{verificationRequiredTitle}</h2>
					<p className="mt-1 text-sm text-amber-800">{notVerifiedError}</p>
				</section>
			</PageContainer>
		);
	}

	const [availableBookings, acceptedBookings] = await Promise.all([
		getAvailableBookingsForCurrentCaregiver(),
		getAcceptedBookingsForCurrentCaregiver(),
	]);

	return (
		<PageContainer>
			{assignmentsHeader}
			<div className="space-y-10">
				<AssignmentsSection
					id="available-bookings-title"
					title={availableTitle}
					emptyMessage={availableEmpty}
					isEmpty={availableBookings.length === 0}
				>
					{availableBookings.map((booking) => (
						<AvailableBookingCard key={booking.id} booking={booking} />
					))}
				</AssignmentsSection>

				<AssignmentsSection
					id="accepted-bookings-title"
					title={acceptedTitle}
					emptyMessage={acceptedEmpty}
					isEmpty={acceptedBookings.length === 0}
				>
					{acceptedBookings.map((booking) => (
						<AcceptedBookingCard key={booking.id} booking={booking} />
					))}
				</AssignmentsSection>
			</div>
		</PageContainer>
	);
}
