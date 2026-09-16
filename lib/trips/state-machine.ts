import { TripStatus } from '@/generated/prisma/enums';

export type TripActor = 'CAREGIVER' | 'GUARDIAN';

type Transition = {
	from: TripStatus;
	to: TripStatus;
	actors: readonly TripActor[];
};

const TRANSITIONS: readonly Transition[] = [
	{ from: TripStatus.SCHEDULED, to: TripStatus.EN_ROUTE_TO_SCHOOL, actors: ['CAREGIVER'] },
	{ from: TripStatus.EN_ROUTE_TO_SCHOOL, to: TripStatus.CHILD_PICKED_UP, actors: ['CAREGIVER'] },
	{ from: TripStatus.CHILD_PICKED_UP, to: TripStatus.AT_ACTIVITY, actors: ['CAREGIVER'] },
	{ from: TripStatus.CHILD_PICKED_UP, to: TripStatus.EN_ROUTE_HOME, actors: ['CAREGIVER'] },
	{ from: TripStatus.AT_ACTIVITY, to: TripStatus.EN_ROUTE_HOME, actors: ['CAREGIVER'] },
	{ from: TripStatus.EN_ROUTE_HOME, to: TripStatus.COMPLETED, actors: ['CAREGIVER'] },
	{ from: TripStatus.SCHEDULED, to: TripStatus.CANCELLED, actors: ['CAREGIVER', 'GUARDIAN'] },
	{
		from: TripStatus.EN_ROUTE_TO_SCHOOL,
		to: TripStatus.CANCELLED,
		actors: ['CAREGIVER', 'GUARDIAN'],
	},
] as const;

export const canTransition = (from: TripStatus, to: TripStatus, actor: TripActor): boolean =>
	TRANSITIONS.some(
		(transition) =>
			transition.from === from && transition.to === to && transition.actors.includes(actor),
	);

export const getAvailableTransitions = (from: TripStatus, actor: TripActor): TripStatus[] =>
	TRANSITIONS.filter(
		(transition) => transition.from === from && transition.actors.includes(actor),
	).map((transition) => transition.to);
