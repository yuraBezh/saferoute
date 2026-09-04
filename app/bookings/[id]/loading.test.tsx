import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BookingDetailsLoading from './loading';

describe('BookingDetailsLoading', () => {
	it('renders the booking details skeleton', () => {
		const { container } = render(<BookingDetailsLoading />);
		expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
	});
});
