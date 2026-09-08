import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { assignmentsText } from '@/lib/content/assignments-text';
import AssignmentsError from './error';

const { title, retry: retryLabel } = assignmentsText.error;

describe('AssignmentsError', () => {
	afterEach(() => vi.restoreAllMocks());

	it('shows a safe message, logs the error, and retries', () => {
		const error = new Error('Sensitive database error');
		const retry = vi.fn();
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		render(<AssignmentsError error={error} retry={retry} />);

		expect(screen.getByText(title)).toBeDefined();
		expect(screen.queryByText(error.message)).toBeNull();
		fireEvent.click(screen.getByRole('button', { name: retryLabel }));
		expect(retry).toHaveBeenCalledOnce();
		expect(consoleError).toHaveBeenCalledWith(error);
	});
});
