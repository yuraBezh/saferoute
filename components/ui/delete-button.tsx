'use client';

import { AlertDialog } from 'radix-ui';
import { useState, useTransition } from 'react';
import { DeleteIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

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
				<Button variant="danger">
					<DeleteIcon />
					{text.trigger}
				</Button>
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
							<Button disabled={isPending} variant="secondary">
								{text.cancel}
							</Button>
						</AlertDialog.Cancel>

						<AlertDialog.Action asChild>
							<Button
								disabled={isPending}
								aria-busy={isPending}
								onClick={handleDelete}
								variant="danger"
							>
								{isPending ? text.deleting : text.delete}
							</Button>
						</AlertDialog.Action>
					</div>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
