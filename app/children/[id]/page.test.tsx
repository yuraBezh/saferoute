import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import childDetailsText from '@/lib/content/child-details-text';

const mocks = vi.hoisted(() => ({
	getChildForCurrentUser: vi.fn(),
	childHeader: vi.fn((props: unknown) => {
		void props;
		return null;
	}),
	guardiansList: vi.fn((props: unknown) => {
		void props;
		return null;
	}),
	notFound: vi.fn(() => {
		throw new Error('NEXT_NOT_FOUND');
	}),
}));

vi.mock('@/lib/data/children', () => ({
	getChildForCurrentUser: mocks.getChildForCurrentUser,
}));

vi.mock('next/navigation', () => ({
	notFound: mocks.notFound,
}));

vi.mock('./child-header', () => ({ ChildHeader: mocks.childHeader }));
vi.mock('./guardians-list', () => ({ GuardiansList: mocks.guardiansList }));

import ChildDetailsPage from './page';

const childFixture = {
	id: 'child-1',
	firstName: 'John',
	lastName: 'Krasinski',
	birthDate: new Date('2010-01-01T00:00:00.000Z'),
	createdAt: new Date('2026-08-05T00:00:00.000Z'),
	guardians: [],
};

function renderPage(id: string) {
	return ChildDetailsPage({
		params: Promise.resolve({ id }),
		searchParams: Promise.resolve({}),
	});
}

describe('ChildDetailsPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('loads the accessible child by route id', async () => {
		mocks.getChildForCurrentUser.mockResolvedValue(childFixture);

		await renderPage(childFixture.id);

		expect(mocks.getChildForCurrentUser).toHaveBeenCalledWith(childFixture.id);
	});

	it('calls notFound when the child does not exist', async () => {
		mocks.getChildForCurrentUser.mockResolvedValue(null);

		await expect(renderPage('missing-child')).rejects.toThrow('NEXT_NOT_FOUND');
		expect(mocks.notFound).toHaveBeenCalledOnce();
	});

	it('shows formatted dates and passes child data to child components', async () => {
		mocks.getChildForCurrentUser.mockResolvedValue(childFixture);

		render(await renderPage(childFixture.id));
		const dateFormatter = new Intl.DateTimeFormat('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
			timeZone: 'UTC',
		});

		expect(
			screen.getByText(childDetailsText.details.dateOfBirth),
		).toBeDefined();
		expect(
			screen.getByText(dateFormatter.format(childFixture.birthDate)),
		).toBeDefined();
		expect(screen.getByText(childDetailsText.details.added)).toBeDefined();
		expect(
			screen.getByText(dateFormatter.format(childFixture.createdAt)),
		).toBeDefined();
		expect(mocks.childHeader.mock.calls[0][0]).toEqual({
			id: childFixture.id,
			firstName: childFixture.firstName,
			lastName: childFixture.lastName,
			birthDate: childFixture.birthDate,
		});
		expect(mocks.guardiansList.mock.calls[0][0]).toEqual({
			guardians: childFixture.guardians,
		});
	});
});
