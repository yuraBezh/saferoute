'use client';

import { useActionState } from 'react';
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
			<button
				type="submit"
				disabled={isDisabled}
				aria-busy={isPending}
				className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
			>
				{isPending ? acceptPendingLabel : acceptLabel}
			</button>
			{hasError && (
				<p role="alert" className="mt-2 max-w-64 text-sm text-red-700">
					{state.error}
				</p>
			)}
		</form>
	);
}
