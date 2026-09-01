import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type FormActionsProps = {
	cancelHref?: string;
	cancelLabel: string;
	isPending: boolean;
	secondaryAction?: ReactNode;
	submitLabel: string;
	submittingLabel?: string;
};

export function FormActions({
	cancelHref,
	cancelLabel,
	isPending,
	secondaryAction,
	submitLabel,
	submittingLabel = submitLabel,
}: FormActionsProps) {
	return (
		<div
			className={`mt-6 flex gap-3 ${secondaryAction ? 'items-center justify-between' : 'justify-end'}`}
		>
			{secondaryAction && <div>{secondaryAction}</div>}
			<div
				className={`flex gap-3 ${secondaryAction ? '' : 'flex-col-reverse sm:flex-row'}`}
			>
				{cancelHref && (
					<Link
						href={cancelHref}
						className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
					>
						{cancelLabel}
					</Link>
				)}
				<Button type="submit" disabled={isPending}>
					{isPending ? submittingLabel : submitLabel}
				</Button>
			</div>
		</div>
	);
}
