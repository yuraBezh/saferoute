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

const mocks = vi.hoisted(() => ({
	deleteChildAction: vi.fn(),
}));

vi.mock('@/app/children/actions', () => ({
	deleteChildAction: mocks.deleteChildAction,
}));

import { DeleteChildButton } from './delete-child-button';

const childFixture = { id: 'child-1' };

describe('DeleteChildButton', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('opens the confirmation dialog and cancels deletion', async () => {
		render(<DeleteChildButton childId={childFixture.id} />);

		fireEvent.click(
			screen.getByRole('button', {
				name: childDetailsText.actions.delete,
			}),
		);

		const dialog = await screen.findByRole('alertdialog');
		expect(
			within(dialog).getByRole('heading', {
				name: childDetailsText.deleteModal.confirm,
			}),
		).toBeDefined();

		fireEvent.click(
			within(dialog).getByRole('button', {
				name: childDetailsText.deleteModal.cancel,
			}),
		);

		await waitFor(() => {
			expect(screen.queryByRole('alertdialog')).toBeNull();
		});
		expect(mocks.deleteChildAction).not.toHaveBeenCalled();
	});

	it('deletes the child, shows pending state, and closes on success', async () => {
		let resolveDelete: (() => void) | undefined;
		mocks.deleteChildAction.mockReturnValue(
			new Promise<void>((resolve) => {
				resolveDelete = resolve;
			}),
		);
		render(<DeleteChildButton childId={childFixture.id} />);

		fireEvent.click(
			screen.getByRole('button', {
				name: childDetailsText.actions.delete,
			}),
		);
		const dialog = await screen.findByRole('alertdialog');
		fireEvent.click(
			within(dialog).getByRole('button', {
				name: childDetailsText.deleteModal.delete,
			}),
		);

		expect(mocks.deleteChildAction).toHaveBeenCalledWith(childFixture.id);
		const pendingButton = within(dialog).getByRole('button', {
			name: childDetailsText.deleteModal.deleting,
		});
		expect(pendingButton).toHaveProperty('disabled', true);

		await act(async () => {
			resolveDelete?.();
		});

		await waitFor(() => {
			expect(screen.queryByRole('alertdialog')).toBeNull();
		});
	});
});
