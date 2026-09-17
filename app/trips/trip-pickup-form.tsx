'use client';

import { useActionState, useMemo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { tripText } from '@/lib/content/trip-text';
import { confirmPickupAction, type TripActionState } from './actions';

export const PickupForm = ({
	tripId,
	cancelAction,
}: {
	tripId: string;
	cancelAction?: ReactNode;
}) => {
	const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
	const formId = `pickup-form-${tripId}`;
	const [state, formAction, isPending] = useActionState(confirmPickupAction.bind(null, tripId), {
		message: '',
	} satisfies TripActionState);
	const pinError = state.errors?.pin?.[0];

	return (
		<div className="flex flex-1 flex-col">
			<form id={formId} action={formAction} className="space-y-3">
				<input type="hidden" name="idempotencyKey" value={idempotencyKey} />
				<Field
					id="pin"
					label={tripText.pinLabel}
					labelAccessory={<InfoTooltip label={tripText.pinHint}>{tripText.pinHint}</InfoTooltip>}
					error={pinError}
					name="pin"
					inputMode="numeric"
					autoComplete="one-time-code"
					required
				/>
				{state.message && !pinError ? (
					<p role="alert" className="text-sm text-red-700">
						{state.message}
					</p>
				) : null}
			</form>
			<div className="mt-auto flex items-center justify-between gap-4 pt-5">
				<div>{cancelAction}</div>
				<Button type="submit" form={formId} disabled={isPending} aria-busy={isPending}>
					{isPending ? tripText.pendingLabel : tripText.actionLabels.CHILD_PICKED_UP}
				</Button>
			</div>
		</div>
	);
};
