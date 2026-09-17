'use client';

import { useMemo, useActionState } from 'react';
import type { TripStatus } from '@/generated/prisma/enums';
import { Button } from '@/components/ui/button';
import { tripText } from '@/lib/content/trip-text';
import { transitionTripAction, type TripActionState } from './actions';

export function TripTransitionForm({
	tripId,
	to,
	label,
}: {
	tripId: string;
	to: TripStatus;
	label: string;
}) {
	const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
	const [state, formAction, isPending] = useActionState(
		transitionTripAction.bind(null, tripId, to, 'CAREGIVER'),
		{ message: '' } satisfies TripActionState,
	);

	return (
		<form action={formAction} className="flex flex-col items-stretch gap-2 sm:items-end">
			<input type="hidden" name="idempotencyKey" value={idempotencyKey} />
			<Button type="submit" disabled={isPending} aria-busy={isPending}>
				{isPending ? tripText.pendingLabel : label}
			</Button>
			{state.message ? (
				<p role="alert" className="text-sm text-red-700">
					{state.message}
				</p>
			) : null}
		</form>
	);
}
