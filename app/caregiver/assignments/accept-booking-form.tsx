'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { assignmentsText } from '@/lib/content/assignments-text';
import { acceptBookingAction, type AcceptBookingState } from './actions';

const { acceptLabel, acceptPendingLabel, scheduleConflict } = assignmentsText;

type AcceptBookingFormProps = {
	bookingId: string;
	hasCaregiverConflict?: boolean;
};

export function AcceptBookingForm({
	bookingId,
	hasCaregiverConflict = false,
}: AcceptBookingFormProps) {
	const initialState: AcceptBookingState = {
		error: hasCaregiverConflict ? scheduleConflict : null,
	};
	const [state, formAction, isPending] = useActionState(
		acceptBookingAction.bind(null, bookingId),
		initialState,
	);
	const hasError = !!state.error;
	const isDisabled = isPending || hasError;

	return (
		<form action={formAction} className="sm:w-64 sm:text-right">
			<Button
				type="submit"
				disabled={isDisabled}
				aria-busy={isPending}
				className="w-full sm:w-auto"
			>
				{isPending ? acceptPendingLabel : acceptLabel}
			</Button>
			{hasError && (
				<p role="alert" className="mt-2 max-w-64 text-sm text-red-700">
					{state.error}
				</p>
			)}
		</form>
	);
}
