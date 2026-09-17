'use client';

import { useMemo, useActionState } from 'react';
import { TripStatus } from '@/generated/prisma/enums';
import { Button, type ButtonVariant } from '@/components/ui/button';
import { tripText } from '@/lib/content/trip-text';
import { transitionTripAction, type TripActionState } from './actions';

export function TripTransitionForm({
	tripId,
	to,
	label,
	fullWidth = false,
	variant: variantOverride,
}: {
	tripId: string;
	to: TripStatus;
	label: string;
	fullWidth?: boolean;
	variant?: ButtonVariant;
}) {
	const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
	const [state, formAction, isPending] = useActionState(
		transitionTripAction.bind(null, tripId, to, 'CAREGIVER'),
		{ message: '' } satisfies TripActionState,
	);
	const variant =
		variantOverride ??
		(to === TripStatus.CANCELLED
			? 'danger'
			: to === TripStatus.AT_ACTIVITY
				? 'success'
				: 'primary');

	return (
		<form
			action={formAction}
			className={`flex flex-col items-stretch gap-2 sm:items-end ${fullWidth ? 'w-full' : ''}`}
		>
			<input type="hidden" name="idempotencyKey" value={idempotencyKey} />
			<Button
				type="submit"
				disabled={isPending}
				aria-busy={isPending}
				variant={variant}
				className={fullWidth ? 'w-full' : undefined}
			>
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
