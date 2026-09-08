import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { assignmentsText } from '@/lib/content/assignments-text';
import AssignmentsError from './error';

const { title, retry: retryLabel } = assignmentsText.error;

describe('AssignmentsError', () => {
	it('shows a safe message and retries', () => {
		const retry = vi.fn();
		render(<AssignmentsError retry={retry} />);

		expect(screen.getByText(title)).toBeDefined();
		fireEvent.click(screen.getByRole('button', { name: retryLabel }));
		expect(retry).toHaveBeenCalledOnce();
	});
});
