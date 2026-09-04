import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bookingsText } from '@/lib/content/bookings-text';
import BookingDetailsError from './error';

describe('BookingDetailsError', () => {
	afterEach(() => vi.restoreAllMocks());

	it('shows a safe message, logs the error, and retries', () => {
		const error = new Error('Sensitive database error');
		const retry = vi.fn();
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		render(<BookingDetailsError error={error} retry={retry} />);

		expect(screen.getByText(bookingsText.error.title)).toBeDefined();
		expect(screen.queryByText(error.message)).toBeNull();
		fireEvent.click(screen.getByRole('button', { name: bookingsText.error.retry }));
		expect(retry).toHaveBeenCalledOnce();
		expect(consoleError).toHaveBeenCalledWith(error);
	});
});
