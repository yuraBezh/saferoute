import { bookingsText } from '@/lib/content/bookings-text';

type BookingRouteProps = {
	pickup: string;
	activity?: string | null;
	dropoff: string;
};

const {
	pickup: pickupLabel,
	activity: activityLabel,
	dropoff: dropoffLabel,
} = bookingsText.details;

export function BookingRoute({ pickup, activity, dropoff }: BookingRouteProps) {
	const stops = [
		{ label: pickupLabel, name: pickup },
		...(activity ? [{ label: activityLabel, name: activity }] : []),
		{ label: dropoffLabel, name: dropoff },
	];

	return (
		<ol className="space-y-0">
			{stops.map(({ label, name }, index) => (
				<li key={label} className="relative flex gap-3 pb-4 last:pb-0">
					{index < stops.length - 1 ? (
						<span className="absolute top-3 left-[5px] h-full w-px bg-blue-200" />
					) : null}
					<span className="relative mt-1.5 size-3 shrink-0 rounded-full border-2 border-blue-600 bg-white" />
					<div className="min-w-0">
						<p className="text-xs font-medium text-gray-500">{label}</p>
						<p className="truncate text-sm font-semibold text-gray-900">{name}</p>
					</div>
				</li>
			))}
		</ol>
	);
}
