import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import childDetailsText from '@/lib/content/child-details-text';
import { childrenText } from '@/lib/content/children-text';

const mocks = vi.hoisted(() => ({ getAge: vi.fn() }));

vi.mock('@/lib/children/get-age', () => ({ getAge: mocks.getAge }));

import { ChildHeader } from './child-header';

const childFixture = {
	id: 'child-1',
	firstName: 'John',
	lastName: 'Krasinski',
	birthDate: new Date('2010-01-01T00:00:00.000Z'),
};
const ageFixture = 16;

describe('ChildHeader', () => {
	beforeEach(() => {
		mocks.getAge.mockReturnValue(ageFixture);
	});

	it('shows the child name, initials, and age', () => {
		render(<ChildHeader {...childFixture} />);
		const fullName = `${childFixture.firstName} ${childFixture.lastName}`;
		const initials = `${childFixture.firstName[0]}${childFixture.lastName[0]}`;

		expect(screen.getByRole('heading', { name: fullName })).toBeDefined();
		expect(screen.getByText(initials)).toBeDefined();
		expect(
			screen.getByText(`${ageFixture} ${childrenText.yearsOld}`),
		).toBeDefined();
	});

	it('renders the child actions', () => {
		render(<ChildHeader {...childFixture} />);

		expect(
			screen
				.getByRole('link', { name: childDetailsText.actions.edit })
				.getAttribute('href'),
		).toBe(`/children/${childFixture.id}/edit`);
		expect(
			screen.getByRole('button', { name: childDetailsText.actions.delete }),
		).toBeDefined();
	});
});
