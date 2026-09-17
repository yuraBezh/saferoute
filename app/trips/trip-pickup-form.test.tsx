import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { tripText } from '@/lib/content/trip-text';

vi.mock('./actions', () => ({ confirmPickupAction: vi.fn() }));

import { PickupForm } from './trip-pickup-form';

const tripId = 'trip-1';
const idempotencyKey = 'pickup-action-key';

describe('PickupForm', () => {
	beforeEach(() => {
		vi.spyOn(crypto, 'randomUUID').mockReturnValue(idempotencyKey);
	});

	it('shows the PIN field, shared hint tooltip, and both actions', () => {
		render(
			<PickupForm
				tripId={tripId}
				cancelAction={<button type="button">{tripText.actionLabels.CANCELLED}</button>}
			/>,
		);

		expect(screen.getByRole('textbox', { name: tripText.pinLabel })).toBeDefined();
		expect(screen.getByLabelText(tripText.pinHint)).toBeDefined();
		expect(screen.getByRole('tooltip').textContent).toBe(tripText.pinHint);
		expect(screen.getByRole('button', { name: tripText.actionLabels.CANCELLED })).toBeDefined();
		expect(
			screen.getByRole('button', { name: tripText.actionLabels.CHILD_PICKED_UP }),
		).toBeDefined();
	});

	it('keeps one idempotency key when the form rerenders', () => {
		const { container, rerender } = render(<PickupForm tripId={tripId} />);
		const getKey = () =>
			(container.querySelector('input[name="idempotencyKey"]') as HTMLInputElement).value;

		const initialKey = getKey();
		expect(initialKey).toBe(idempotencyKey);
		rerender(<PickupForm tripId={tripId} />);
		expect(getKey()).toBe(initialKey);
	});
});
