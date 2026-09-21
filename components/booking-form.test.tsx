import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BookingFormState } from '@/app/bookings/actions';
import { bookingFormText } from '@/lib/content/booking-form-text';
import { BookingForm } from './booking-form';

const { date: dateText, estimatedDurationMin: durationText } = bookingFormText.fields;
const { validationError } = bookingFormText;

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
	beforeEach(() => {
		action.mockReset();
	});

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

	it('keeps values, clears corrected errors, and hides stale errors while submitting', async () => {
		action.mockResolvedValueOnce({
			message: validationError,
			errors: { date: [dateText.invalid] },
		});
		const { container } = render(
			<BookingForm action={action} childOptions={[childFixture]} locations={[locationFixture]} />,
		);
		const date = screen.getByLabelText(dateText.label) as HTMLInputElement;

		fireEvent.change(date, { target: { value: '2020-01-01' } });
		fireEvent.submit(container.querySelector('form')!);
		await screen.findByText(dateText.invalid);
		expect(date.value).toBe('2020-01-01');
		expect(screen.getByText(validationError)).toBeDefined();

		fireEvent.change(date, { target: { value: '2090-01-01' } });
		await waitFor(() => {
			expect(screen.queryByText(dateText.invalid)).toBeNull();
			expect(screen.queryByText(validationError)).toBeNull();
		});

		let resolveAction!: (state: BookingFormState) => void;
		action.mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					resolveAction = resolve;
				}),
		);
		fireEvent.submit(container.querySelector('form')!);
		expect(screen.queryByText(dateText.invalid)).toBeNull();
		expect(screen.queryByText(validationError)).toBeNull();

		resolveAction({ message: '', errors: {} });
	});
});
