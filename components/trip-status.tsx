import { TripStatus } from '@/generated/prisma/enums';
import { tripText } from '@/lib/content/trip-text';

const statusClasses = {
	[TripStatus.SCHEDULED]: 'bg-blue-50 text-blue-700 ring-blue-600/20',
	[TripStatus.EN_ROUTE_TO_SCHOOL]: 'bg-blue-50 text-blue-700 ring-blue-600/20',
	[TripStatus.CHILD_PICKED_UP]: 'bg-amber-50 text-amber-800 ring-amber-600/20',
	[TripStatus.AT_ACTIVITY]: 'bg-violet-50 text-violet-700 ring-violet-600/20',
	[TripStatus.EN_ROUTE_HOME]: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
	[TripStatus.COMPLETED]: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
	[TripStatus.CANCELLED]: 'bg-red-50 text-red-700 ring-red-600/20',
} as const;

export const TripStatusBadge = ({ status }: { status: TripStatus }) => (
	<span
		className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[status]}`}
	>
		{tripText.statusLabels[status]}
	</span>
);
