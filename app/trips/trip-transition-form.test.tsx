import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TripStatus } from '@/generated/prisma/enums';
import { tripText } from '@/lib/content/trip-text';

vi.mock('./actions', () => ({ transitionTripAction: vi.fn() }));

import { TripTransitionForm } from './trip-transition-form';

describe('TripTransitionForm', () => {
	beforeEach(() => {
		vi.spyOn(crypto, 'randomUUID').mockReturnValue('transition-action-key');
	});

	it('renders cancellation as a danger action', () => {
		render(
			<TripTransitionForm
				tripId="trip-1"
				to={TripStatus.CANCELLED}
				label={tripText.actionLabels.CANCELLED}
			/>,
		);

		expect(
			screen.getByRole('button', { name: tripText.actionLabels.CANCELLED }).className,
		).toContain('bg-red-600');
	});
});
