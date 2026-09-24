import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { genericPageError } from '@/lib/content/error-text';
import { GenericFormError, GenericPageError } from './page-error-state';

describe('GenericPageError', () => {
	afterEach(() => vi.restoreAllMocks());

	it('shows a safe message, logs the error, and retries', () => {
		const error = new Error('Sensitive database error');
		const retry = vi.fn();
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		render(<GenericPageError error={error} retry={retry} />);

		expect(screen.getByText(genericPageError.title)).toBeDefined();
		expect(screen.getByText(genericPageError.description)).toBeDefined();
		expect(screen.queryByText(error.message)).toBeNull();
		fireEvent.click(screen.getByRole('button', { name: genericPageError.retry }));
		expect(retry).toHaveBeenCalledOnce();
		expect(consoleError).toHaveBeenCalledWith(error);
	});
});

describe('GenericFormError', () => {
	afterEach(() => vi.restoreAllMocks());

	it('shows a safe message, logs the error, and retries', () => {
		const error = new Error('Sensitive database error');
		const retry = vi.fn();
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		render(<GenericFormError error={error} retry={retry} />);

		expect(screen.getByText(genericPageError.title)).toBeDefined();
		fireEvent.click(screen.getByRole('button', { name: genericPageError.retry }));
		expect(retry).toHaveBeenCalledOnce();
		expect(consoleError).toHaveBeenCalledWith(error);
	});
});
