import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { childDetailsText } from '@/lib/content/child-details-text';
import { ChildActions } from './child-actions';

describe('ChildActions', () => {
	const childIdFixture = 'child-1';

	it('links Edit to the child edit page', () => {
		render(<ChildActions childId={childIdFixture} />);

		expect(
			screen
				.getByRole('link', { name: childDetailsText.actions.edit })
				.getAttribute('href'),
		).toBe(`/children/${childIdFixture}/edit`);
	});

	it('renders Delete as a button', () => {
		render(<ChildActions childId={childIdFixture} />);

		expect(
			screen.getByRole('button', { name: childDetailsText.actions.delete }),
		).toBeDefined();
	});
});
