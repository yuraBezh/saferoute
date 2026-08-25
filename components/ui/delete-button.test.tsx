import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import childDetailsText from '@/lib/content/child-details-text';
import { DeleteButton } from '@/components/ui/delete-button';

const mocks = vi.hoisted(() => ({
	deleteAction: vi.fn(),
}));

const item = { id: 'item-1' };
const text = {
	trigger: childDetailsText.actions.delete,
	...childDetailsText.deleteModal,
};

describe('DeleteButton', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('opens the confirmation dialog and cancels deletion', async () => {
		render(
			<DeleteButton
				itemId={item.id}
				deleteAction={mocks.deleteAction}
				text={text}
			/>,
		);

		fireEvent.click(screen.getByRole('button', { name: text.trigger }));

		const dialog = await screen.findByRole('alertdialog');
		expect(
			within(dialog).getByRole('heading', { name: text.confirm }),
		).toBeDefined();
		expect(within(dialog).getByText(text.description)).toBeDefined();

		fireEvent.click(within(dialog).getByRole('button', { name: text.cancel }));

		await waitFor(() => {
			expect(screen.queryByRole('alertdialog')).toBeNull();
		});
		expect(mocks.deleteAction).not.toHaveBeenCalled();
	});

	it('submits deletion and shows pending state', async () => {
		let resolveDelete: (() => void) | undefined;
		mocks.deleteAction.mockReturnValue(
			new Promise<void>((resolve) => {
				resolveDelete = resolve;
			}),
		);
		render(
			<DeleteButton
				itemId={item.id}
				deleteAction={mocks.deleteAction}
				text={text}
			/>,
		);

		fireEvent.click(screen.getByRole('button', { name: text.trigger }));
		const dialog = await screen.findByRole('alertdialog');
		fireEvent.click(within(dialog).getByRole('button', { name: text.delete }));

		expect(mocks.deleteAction).toHaveBeenCalledWith(item.id);
		expect(
			within(dialog).getByRole('button', { name: text.deleting }),
		).toHaveProperty('disabled', true);

		await act(async () => {
			resolveDelete?.();
		});

		expect(
			within(dialog).getByRole('button', { name: text.delete }),
		).toHaveProperty('disabled', false);
	});
});
