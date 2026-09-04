import { BookingStatus } from '@/generated/prisma/enums';
import { bookingsText } from '@/lib/content/bookings-text';

const statusClasses = {
	[BookingStatus.PENDING]: 'bg-amber-50 text-amber-800 ring-amber-600/20',
	[BookingStatus.ACCEPTED]: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
	[BookingStatus.DECLINED]: 'bg-red-50 text-red-700 ring-red-600/20',
	[BookingStatus.CANCELLED]: 'bg-gray-100 text-gray-600 ring-gray-500/20',
	[BookingStatus.EXPIRED]: 'bg-gray-100 text-gray-600 ring-gray-500/20',
} as const;

const { status: statusLabels } = bookingsText;

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
	return (
		<span
			className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[status]}`}
		>
			{statusLabels[status]}
		</span>
	);
}
