import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { BookingFormState } from '@/app/bookings/actions';
import { bookingFormText } from '@/lib/content/booking-form-text';
import { BookingForm } from './booking-form';

const { estimatedDurationMin: durationText } = bookingFormText.fields;

const childFixture = { id: 'child-1', firstName: 'John', lastName: 'Krasinski' };
const locationFixture = { id: 'location-1', name: 'School' };
const fieldNames = [
	'childId',
	'date',
	'time',
	'pickupLocationId',
	'activityLocationId',
	'dropoffLocationId',
	'estimatedDurationMin',
	'notes',
] as const;

const action = vi.fn(async (): Promise<BookingFormState> => ({ message: '' }));

describe('BookingForm', () => {
	it('renders fields in booking order and uses fixed duration choices', () => {
		const { container } = render(
			<BookingForm action={action} childOptions={[childFixture]} locations={[locationFixture]} />,
		);
		const form = container.querySelector('form');
		const renderedNames = Array.from(form?.elements ?? [])
			.map((element) => element.getAttribute('name'))
			.filter((name): name is string => Boolean(name));

		expect(renderedNames).toEqual(fieldNames);
		const duration = screen.getByLabelText(durationText.label) as HTMLSelectElement;
		expect(Array.from(duration.options).map(({ value }) => value)).toEqual(
			durationText.options.map(({ value }) => value),
		);
	});
});
