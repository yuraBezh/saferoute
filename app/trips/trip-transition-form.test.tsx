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

	it('renders arrival at the activity as a success action', () => {
		render(
			<TripTransitionForm
				tripId="trip-1"
				to={TripStatus.AT_ACTIVITY}
				label={tripText.actionLabels.AT_ACTIVITY}
				fullWidth
			/>,
		);

		const button = screen.getByRole('button', { name: tripText.actionLabels.AT_ACTIVITY });
		expect(button.className).toContain('bg-green-600');
		expect(button.className).toContain('w-full');
	});

	it('supports a warning style for a secondary trip action', () => {
		render(
			<TripTransitionForm
				tripId="trip-1"
				to={TripStatus.EN_ROUTE_HOME}
				label={tripText.skipActivityAction}
				variant="warning"
			/>,
		);

		expect(screen.getByRole('button', { name: tripText.skipActivityAction }).className).toContain(
			'bg-amber-100',
		);
	});
});
