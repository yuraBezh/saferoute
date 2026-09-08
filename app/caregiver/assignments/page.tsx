import { CaregiverStatus, UserRole } from '@/generated/prisma/enums';
import { AcceptedBookingCard } from '@/app/caregiver/assignments/accepted-booking-card';
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
				<section aria-labelledby="available-bookings-title">
					<h2 id="available-bookings-title" className="text-lg font-semibold text-gray-950">
						{availableTitle}
					</h2>
					{availableBookings.length === 0 ? (
						<p className="mt-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center text-sm text-gray-600">
							{availableEmpty}
						</p>
					) : (
						<ul className="mt-3 space-y-3">
							{availableBookings.map((booking) => (
								<AvailableBookingCard key={booking.id} booking={booking} />
							))}
						</ul>
					)}
				</section>

				<section aria-labelledby="accepted-bookings-title">
					<h2 id="accepted-bookings-title" className="text-lg font-semibold text-gray-950">
						{acceptedTitle}
					</h2>
					{acceptedBookings.length === 0 ? (
						<p className="mt-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center text-sm text-gray-600">
							{acceptedEmpty}
						</p>
					) : (
						<ul className="mt-3 space-y-4">
							{acceptedBookings.map((booking) => (
								<AcceptedBookingCard key={booking.id} booking={booking} />
							))}
						</ul>
					)}
				</section>
			</div>
		</PageContainer>
	);
}
