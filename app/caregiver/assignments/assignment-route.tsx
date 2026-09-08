import { bookingsText } from '@/lib/content/bookings-text';

const {
	pickup: pickupLabel,
	activity: activityLabel,
	dropoff: dropoffLabel,
} = bookingsText.details;

export type AssignmentRoutePoint = {
	name: string;
	detail: string;
};

type AssignmentRouteProps = {
	pickup: AssignmentRoutePoint;
	activity: AssignmentRoutePoint | null;
	dropoff: AssignmentRoutePoint;
};

export function AssignmentRoute({ pickup, activity, dropoff }: AssignmentRouteProps) {
	const stops = [
		{ label: pickupLabel, ...pickup },
		...(activity ? [{ label: activityLabel, ...activity }] : []),
		{ label: dropoffLabel, ...dropoff },
	];

	return (
		<ol className="space-y-0">
			{stops.map(({ label, name, detail }, index) => (
				<li key={label} className="relative flex gap-3 pb-4 last:pb-0">
					{index < stops.length - 1 ? (
						<span className="absolute top-3 left-[5px] h-full w-px bg-blue-200" />
					) : null}
					<span className="relative mt-1.5 size-3 shrink-0 rounded-full border-2 border-blue-600 bg-white" />
					<div className="min-w-0">
						<p className="text-xs font-medium text-gray-500">{label}</p>
						<p className="font-semibold text-gray-950">{name}</p>
						<p className="mt-0.5 text-sm text-gray-600">{detail}</p>
					</div>
				</li>
			))}
		</ol>
	);
}
