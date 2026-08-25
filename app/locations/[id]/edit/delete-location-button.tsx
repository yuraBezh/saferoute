'use client';

import { AlertDialog } from 'radix-ui';
import { useState, useTransition } from 'react';
import { deleteLocationAction } from '@/app/locations/actions';
import { DeleteIcon } from '@/components/ui/icons';
import { editLocationFormText } from '@/lib/content/location-form-text';

export function DeleteLocationButton({ locationId }: { locationId: string }) {
	const [isOpen, setIsOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const { delete: deleteText } = editLocationFormText;

	function handleDelete(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();

		startTransition(async () => {
			await deleteLocationAction(locationId);
		});
	}

	return (
		<AlertDialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialog.Trigger asChild>
				<button
					type="button"
					className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
				>
					<DeleteIcon />
					{deleteText.trigger}
				</button>
			</AlertDialog.Trigger>

			<AlertDialog.Portal>
				<AlertDialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
				<AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
					<AlertDialog.Title className="text-lg font-semibold text-gray-950">
						{deleteText.confirm}
					</AlertDialog.Title>
					<AlertDialog.Description className="mt-2 text-sm text-gray-600">
						{deleteText.description}
					</AlertDialog.Description>
					<div className="mt-6 flex justify-end gap-3">
						<AlertDialog.Cancel asChild>
							<button
								type="button"
								disabled={isPending}
								className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
							>
								{deleteText.cancel}
							</button>
						</AlertDialog.Cancel>

						<AlertDialog.Action asChild>
							<button
								type="button"
								disabled={isPending}
								aria-busy={isPending}
								onClick={handleDelete}
								className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
							>
								{isPending ? deleteText.deleting : deleteText.delete}
							</button>
						</AlertDialog.Action>
					</div>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
