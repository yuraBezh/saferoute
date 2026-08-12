import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { childDetailsText } from '@/lib/content/child-details-text';
import ChildDetailsError from './error';

describe('ChildDetailsError', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('shows a safe error message and logs the error', () => {
		const error = new globalThis.Error('Database credentials leaked');
		const consoleError = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);

		render(<ChildDetailsError error={error} reset={vi.fn()} />);

		expect(screen.getByText(childDetailsText.error.title)).toBeDefined();
		expect(screen.queryByText(error.message)).toBeNull();
		expect(consoleError).toHaveBeenCalledWith(error);
	});

	it('calls reset when Try again is clicked', () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const reset = vi.fn();
		render(
			<ChildDetailsError
				error={new globalThis.Error('Failed')}
				reset={reset}
			/>,
		);

		fireEvent.click(
			screen.getByRole('button', { name: childDetailsText.error.retry }),
		);

		expect(reset).toHaveBeenCalledOnce();
	});
});
