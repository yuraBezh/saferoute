'use client';

import { useActionState } from 'react';
import { selfVerifyAction, type SelfVerifyState } from '@/app/caregiver/actions';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { caregiverText } from '@/lib/content/caregiver-text';

const { verifyLabel, verifyingLabel } = caregiverText;
const initialState: SelfVerifyState = { message: '' };

export function SelfVerifyForm() {
	const [state, action, isPending] = useActionState(selfVerifyAction, initialState);

	return (
		<div className="mt-5">
			<form action={action}>
				<Button type="submit" disabled={isPending} aria-busy={isPending}>
					{isPending ? verifyingLabel : verifyLabel}
				</Button>
			</form>
			<div className="mt-3">
				<FormError message={state.message} />
			</div>
		</div>
	);
}
