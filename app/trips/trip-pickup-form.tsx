'use client';

import { useActionState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { tripText } from '@/lib/content/trip-text';
import { confirmPickupAction, type TripActionState } from './actions';

export const PickupForm = ({ tripId }: { tripId: string }) => {
	const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
	const [state, formAction, isPending] = useActionState(confirmPickupAction.bind(null, tripId), {
		message: '',
	} satisfies TripActionState);

	return (
		<form action={formAction} className="space-y-3 sm:min-w-64">
			<input type="hidden" name="idempotencyKey" value={idempotencyKey} />
			<label className="block text-sm font-medium text-gray-700" htmlFor="pin">
				{tripText.pinLabel}
			</label>
			<Input id="pin" name="pin" inputMode="numeric" autoComplete="one-time-code" required />
			<p className="text-xs text-gray-500">{tripText.pinHint}</p>
			<Button type="submit" disabled={isPending} aria-busy={isPending}>
				{isPending ? tripText.pendingLabel : tripText.actionLabels.CHILD_PICKED_UP}
			</Button>
			{state.message ? (
				<p role="alert" className="text-sm text-red-700">
					{state.message}
				</p>
			) : null}
		</form>
	);
};
