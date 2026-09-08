import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CaregiverStatus, UserRole } from '@/generated/prisma/enums';
import { formatBookingPickup } from '@/lib/bookings/format';
import { assignmentsText } from '@/lib/content/assignments-text';
import { formatAddress } from '@/lib/locations/format-address';

const {
	availableTitle,
	acceptedTitle,
	acceptLabel,
	availableEmpty,
	acceptedEmpty,
	verificationRequiredTitle,
	notVerifiedError,
	duration,
} = assignmentsText;

const mocks = vi.hoisted(() => ({
	requireRole: vi.fn(),
	getCaregiverStatus: vi.fn(),
	getAvailableBookings: vi.fn(),
	getAcceptedBookings: vi.fn(),
}));

vi.mock('@/lib/auth/roles', () => ({ requireRole: mocks.requireRole }));
vi.mock('@/lib/data/caregivers', () => ({ getCaregiverStatus: mocks.getCaregiverStatus }));
vi.mock('@/lib/data/caregiver-bookings', () => ({
	getAvailableBookingsForCurrentCaregiver: mocks.getAvailableBookings,
	getAcceptedBookingsForCurrentCaregiver: mocks.getAcceptedBookings,
}));

import AssignmentsPage from './page';

const availableBooking = {
	id: 'available-booking',
	child: { firstName: 'Maya' },
	scheduledPickupAt: new Date('2026-09-15T20:30:00.000Z'),
	estimatedDurationMin: 45,
	pickupLocation: { name: 'Lamar High School', city: 'Houston', timezone: 'America/Chicago' },
	activityLocation: { name: 'Houston Ballet Academy', city: 'Houston' },
	dropoffLocation: { name: 'Maya’s Home', city: 'Bellaire' },
};

const acceptedBooking = {
	id: 'accepted-booking',
	child: { id: 'child', firstName: 'Leo', lastName: 'Martinez' },
	requestedBy: { fullName: 'Sofia Martinez', phone: '+1 713 555 0142' },
	scheduledPickupAt: new Date('2026-09-16T21:00:00.000Z'),
	estimatedDurationMin: 35,
	notes: 'Please call when you arrive.',
	pickupLocation: {
		name: 'Pershing Middle School',
		addressLine1: '3838 Blue Bonnet Blvd',
		addressLine2: null,
		city: 'Houston',
		state: 'TX',
		postalCode: '77025',
		timezone: 'America/Chicago',
	},
	activityLocation: null,
	dropoffLocation: {
		name: 'Martinez Home',
		addressLine1: '2210 W Holcombe Blvd',
		addressLine2: 'Apt 4',
		city: 'Houston',
		state: 'TX',
		postalCode: '77030',
		timezone: 'America/Chicago',
	},
};

describe('AssignmentsPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getCaregiverStatus.mockResolvedValue(CaregiverStatus.VERIFIED);
		mocks.getAvailableBookings.mockResolvedValue([availableBooking]);
		mocks.getAcceptedBookings.mockResolvedValue([acceptedBooking]);
	});

	it('shows available bookings and accepted assignment details to a caregiver', async () => {
		const {
			child: availableChild,
			scheduledPickupAt,
			estimatedDurationMin,
			pickupLocation,
			activityLocation,
			dropoffLocation,
		} = availableBooking;
		const {
			child: acceptedChild,
			requestedBy,
			pickupLocation: acceptedPickupLocation,
			dropoffLocation: acceptedDropoffLocation,
			notes,
		} = acceptedBooking;
		const { firstName: availableFirstName } = availableChild;
		const { name: pickupName, timezone } = pickupLocation;
		const { name: activityName } = activityLocation;
		const { city: dropoffCity } = dropoffLocation;
		const { firstName: acceptedFirstName, lastName: acceptedLastName } = acceptedChild;
		const { fullName: parentName, phone } = requestedBy;
		render(await AssignmentsPage());

		expect(mocks.requireRole).toHaveBeenCalledWith(UserRole.CAREGIVER);
		expect(screen.getByRole('heading', { name: availableTitle })).toBeDefined();
		expect(screen.getByText(availableFirstName)).toBeDefined();
		expect(screen.getByText(formatBookingPickup(scheduledPickupAt, timezone))).toBeDefined();
		expect(screen.getByText(duration(estimatedDurationMin))).toBeDefined();
		expect(screen.getByText(pickupName)).toBeDefined();
		expect(screen.getByText(activityName)).toBeDefined();
		expect(screen.getByText(dropoffCity)).toBeDefined();
		expect(screen.getByRole('button', { name: acceptLabel })).toBeDefined();

		expect(screen.getByRole('heading', { name: acceptedTitle })).toBeDefined();
		expect(screen.getByText(`${acceptedFirstName} ${acceptedLastName}`)).toBeDefined();
		expect(screen.getByText(formatAddress(acceptedPickupLocation))).toBeDefined();
		expect(screen.getByText(formatAddress(acceptedDropoffLocation))).toBeDefined();
		expect(screen.getByText(parentName)).toBeDefined();
		expect(screen.getByText(phone)).toBeDefined();
		expect(screen.getByText(notes)).toBeDefined();
	});

	it('shows an empty state for both sections', async () => {
		mocks.getAvailableBookings.mockResolvedValue([]);
		mocks.getAcceptedBookings.mockResolvedValue([]);

		render(await AssignmentsPage());

		expect(screen.getByText(availableEmpty)).toBeDefined();
		expect(screen.getByText(acceptedEmpty)).toBeDefined();
	});

	it('shows verification status without loading bookings for an unverified caregiver', async () => {
		mocks.getCaregiverStatus.mockResolvedValue(CaregiverStatus.PENDING_VERIFICATION);

		render(await AssignmentsPage());

		expect(screen.getByText(verificationRequiredTitle)).toBeDefined();
		expect(screen.getByText(notVerifiedError)).toBeDefined();
		expect(mocks.getAvailableBookings).not.toHaveBeenCalled();
		expect(mocks.getAcceptedBookings).not.toHaveBeenCalled();
	});
});
