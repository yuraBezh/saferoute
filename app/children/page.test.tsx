import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { childrenText } from '@/lib/content/children-text';

const mocks = vi.hoisted(() => ({
	getChildrenForCurrentUser: vi.fn(),
	getAge: vi.fn(),
}));

vi.mock('@/lib/data/children', () => ({
	getChildrenForCurrentUser: mocks.getChildrenForCurrentUser,
}));

vi.mock('@/lib/children/get-age', () => ({
	getAge: mocks.getAge,
}));

import Children from './page';

const childFixture = {
	id: 'child-1',
	firstName: 'John',
	lastName: 'Krasinski',
	birthDate: new Date('2010-01-01T00:00:00.000Z'),
	_count: { guardians: 1 },
};
const ageFixture = 16;

describe('Children', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getAge.mockReturnValue(ageFixture);
	});

	it('loads children for the current user', async () => {
		mocks.getChildrenForCurrentUser.mockResolvedValue([]);

		await Children();

		expect(mocks.getChildrenForCurrentUser).toHaveBeenCalledOnce();
	});

	it('shows child details and links to the child page', async () => {
		mocks.getChildrenForCurrentUser.mockResolvedValue([childFixture]);

		render(await Children());
		const fullName = `${childFixture.firstName} ${childFixture.lastName}`;
		const initials = `${childFixture.firstName[0]}${childFixture.lastName[0]}`;

		expect(screen.getByText(fullName)).toBeDefined();
		expect(
			screen.getByText(
				`${ageFixture} ${childrenText.yearsOld} · ${childrenText.guardianCount(1)}`,
			),
		).toBeDefined();
		expect(screen.getByText(initials)).toBeDefined();
		expect(
			screen
				.getByRole('link', { name: new RegExp(fullName) })
				.getAttribute('href'),
		).toBe(`/children/${childFixture.id}`);
	});

	it('uses plural labels for multiple children and guardians', async () => {
		mocks.getChildrenForCurrentUser.mockResolvedValue([
			{ ...childFixture, _count: { guardians: 2 } },
			{ ...childFixture, id: 'child-2', firstName: 'Bobby' },
		]);

		render(await Children());

		expect(screen.getByText(childrenText.childCount(2))).toBeDefined();
		expect(
			screen.getByText(
				`${ageFixture} ${childrenText.yearsOld} · ${childrenText.guardianCount(2)}`,
			),
		).toBeDefined();
	});
});
