import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { editChildFormText } from '@/lib/content/child-form-text';
import type { ComponentProps } from 'react';
import type { ChildForm } from '@/components/child-form';

type ChildFormProps = ComponentProps<typeof ChildForm>;

const mocks = vi.hoisted(() => ({
	findUniqueChild: vi.fn(),
	editChildAction: vi.fn(),
	childForm: vi.fn((props: ChildFormProps) => {
		void props;
		return null;
	}),
	notFound: vi.fn(() => {
		throw new Error('NEXT_NOT_FOUND');
	}),
}));

vi.mock('@/lib/prisma', () => ({
	prisma: { child: { findUnique: mocks.findUniqueChild } },
}));

vi.mock('next/navigation', () => ({
	notFound: mocks.notFound,
}));

vi.mock('@/app/children/actions', () => ({
	editChildAction: mocks.editChildAction,
}));

vi.mock('@/components/child-form', () => ({
	ChildForm: mocks.childForm,
}));

import EditChildrenPage from './page';
import type { ChildFormState } from '@/app/children/actions';

const childFixture = {
	id: 'child-1',
	firstName: 'John',
	lastName: 'Krasinski',
	birthDate: new Date('2010-01-01T00:00:00.000Z'),
};

function renderPage(id: string) {
	return EditChildrenPage({
		params: Promise.resolve({ id }),
		searchParams: Promise.resolve({}),
	});
}

describe('EditChildrenPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('queries the child by route id', async () => {
		mocks.findUniqueChild.mockResolvedValue(childFixture);

		await renderPage(childFixture.id);

		expect(mocks.findUniqueChild).toHaveBeenCalledWith({
			where: { id: childFixture.id },
		});
	});

	it('calls notFound when the child does not exist', async () => {
		const missingChild = { id: 'missing-child' };
		mocks.findUniqueChild.mockResolvedValue(null);

		await expect(renderPage(missingChild.id)).rejects.toThrow('NEXT_NOT_FOUND');
		expect(mocks.notFound).toHaveBeenCalledOnce();
	});

	it('shows child context and passes editable values to the form', async () => {
		mocks.findUniqueChild.mockResolvedValue(childFixture);

		render(await renderPage(childFixture.id));
		const fullName = `${childFixture.firstName} ${childFixture.lastName}`;
		const formProps = mocks.childForm.mock.calls[0][0];

		expect(
			screen.getByRole('link', { name: fullName }).getAttribute('href'),
		).toBe(`/children/${childFixture.id}`);
		expect(screen.getByText(editChildFormText.title)).toBeDefined();
		expect(
			screen.getByText(editChildFormText.description(fullName)),
		).toBeDefined();
		expect(formProps).toMatchObject({
			defaultValues: {
				firstName: childFixture.firstName,
				lastName: childFixture.lastName,
				birthDate: childFixture.birthDate.toISOString().slice(0, 10),
			},
			submitLabel: editChildFormText.submit,
			submittingLabel: editChildFormText.submitting,
			cancelHref: `/children/${childFixture.id}`,
		});

		const state: ChildFormState = { message: '', errors: {} };
		const formData = new FormData();
		await formProps.formAction(state, formData);
		expect(mocks.editChildAction).toHaveBeenCalledWith(
			childFixture.id,
			state,
			formData,
		);
	});
});
