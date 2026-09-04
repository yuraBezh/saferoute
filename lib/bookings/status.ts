import { BookingStatus } from '@/generated/prisma/enums';

type BookingStatusInput = {
	status: BookingStatus;
	expiresAt: Date;
};

export function displayStatus({ status, expiresAt }: BookingStatusInput) {
	if (status === BookingStatus.PENDING && expiresAt < new Date()) {
		return BookingStatus.EXPIRED;
	}

	return status;
}
