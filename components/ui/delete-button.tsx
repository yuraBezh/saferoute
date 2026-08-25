'use client';

import { AlertDialog } from 'radix-ui';
import { useState, useTransition } from 'react';
import { DeleteIcon } from '@/components/ui/icons';

export type DeleteButtonText = {
	trigger: string;
	confirm: string;
	description: string;
	cancel: string;
	delete: string;
	deleting: string;
};

export function DeleteButton({
	itemId,
	deleteAction,
	text,
}: {
	itemId: string;
	deleteAction: (id: string) => Promise<void>;
	text: DeleteButtonText;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [isPending, startTransition] = useTransition();

	function handleDelete(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();

		startTransition(async () => {
			await deleteAction(itemId);
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
					{text.trigger}
				</button>
			</AlertDialog.Trigger>

			<AlertDialog.Portal>
				<AlertDialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
				<AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
					<AlertDialog.Title className="text-lg font-semibold text-gray-950">
						{text.confirm}
					</AlertDialog.Title>
					<AlertDialog.Description className="mt-2 text-sm text-gray-600">
						{text.description}
					</AlertDialog.Description>
					<div className="mt-6 flex justify-end gap-3">
						<AlertDialog.Cancel asChild>
							<button
								type="button"
								disabled={isPending}
								className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
							>
								{text.cancel}
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
								{isPending ? text.deleting : text.delete}
							</button>
						</AlertDialog.Action>
					</div>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
