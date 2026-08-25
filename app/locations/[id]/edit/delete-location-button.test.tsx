import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { editLocationFormText } from '@/lib/content/location-form-text';

const mocks = vi.hoisted(() => ({
	deleteLocationAction: vi.fn(),
}));

vi.mock('@/app/locations/actions', () => ({
	deleteLocationAction: mocks.deleteLocationAction,
}));

import { DeleteLocationButton } from './delete-location-button';

const location = { id: 'location-1' };
const { delete: deleteText } = editLocationFormText;

describe('DeleteLocationButton', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('opens the confirmation dialog and cancels deletion', async () => {
		render(<DeleteLocationButton locationId={location.id} />);

		fireEvent.click(screen.getByRole('button', { name: deleteText.trigger }));

		const dialog = await screen.findByRole('alertdialog');
		expect(
			within(dialog).getByRole('heading', { name: deleteText.confirm }),
		).toBeDefined();
		expect(within(dialog).getByText(deleteText.description)).toBeDefined();

		fireEvent.click(
			within(dialog).getByRole('button', { name: deleteText.cancel }),
		);

		await waitFor(() => {
			expect(screen.queryByRole('alertdialog')).toBeNull();
		});
		expect(mocks.deleteLocationAction).not.toHaveBeenCalled();
	});

	it('submits deletion and shows pending state', async () => {
		let resolveDelete: (() => void) | undefined;
		mocks.deleteLocationAction.mockReturnValue(
			new Promise<void>((resolve) => {
				resolveDelete = resolve;
			}),
		);
		render(<DeleteLocationButton locationId={location.id} />);

		fireEvent.click(screen.getByRole('button', { name: deleteText.trigger }));
		const dialog = await screen.findByRole('alertdialog');
		fireEvent.click(
			within(dialog).getByRole('button', { name: deleteText.delete }),
		);

		expect(mocks.deleteLocationAction).toHaveBeenCalledWith(location.id);
		expect(
			within(dialog).getByRole('button', { name: deleteText.deleting }),
		).toHaveProperty('disabled', true);

		await act(async () => {
			resolveDelete?.();
		});

		expect(
			within(dialog).getByRole('button', { name: deleteText.delete }),
		).toHaveProperty('disabled', false);
	});
});
