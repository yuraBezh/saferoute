import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LocationForm } from '@/components/location-form';
import { LocationType } from '@/generated/prisma/enums';
import { editLocationFormText } from '@/lib/content/location-form-text';
import { locationsText } from '@/lib/content/locations-text';

type LocationFormProps = ComponentProps<typeof LocationForm>;

const mocks = vi.hoisted(() => ({
	findLocation: vi.fn(),
	getCurrentUserId: vi.fn(),
	editLocationAction: vi.fn(),
	locationForm: vi.fn((props: LocationFormProps) => props.footerAction),
	deleteLocationButton: vi.fn(() => null),
	notFound: vi.fn(() => {
		throw new Error('NEXT_NOT_FOUND');
	}),
}));

vi.mock('@/lib/prisma', () => ({
	prisma: { location: { findFirst: mocks.findLocation } },
}));

vi.mock('@/lib/auth/current-user', () => ({
	getCurrentUserId: mocks.getCurrentUserId,
}));

vi.mock('next/navigation', () => ({
	notFound: mocks.notFound,
}));

vi.mock('@/app/locations/actions', () => ({
	editLocationAction: mocks.editLocationAction,
}));

vi.mock('@/components/location-form', () => ({
	LocationForm: mocks.locationForm,
}));

vi.mock('./delete-location-button', () => ({
	DeleteLocationButton: mocks.deleteLocationButton,
}));

import EditLocationPage from './page';
import type { LocationFormState } from '@/app/locations/actions';

const currentUser = { id: 'user-1' };
const location = {
	id: 'location-1',
	type: LocationType.SCHOOL,
	name: 'Lincoln Elementary',
	addressLine1: '123 Main St',
	addressLine2: null,
	city: 'Chicago',
	state: 'IL',
	postalCode: '60601',
	ownerUserId: currentUser.id,
};

function renderPage(id: string) {
	return EditLocationPage({
		params: Promise.resolve({ id }),
		searchParams: Promise.resolve({}),
	});
}

describe('EditLocationPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getCurrentUserId.mockResolvedValue(currentUser.id);
	});

	it('queries the location by route id and current owner', async () => {
		mocks.findLocation.mockResolvedValue(location);

		await renderPage(location.id);

		expect(mocks.findLocation).toHaveBeenCalledWith({
			where: { id: location.id, ownerUserId: currentUser.id },
		});
	});

	it('calls notFound when the location is missing or belongs to another user', async () => {
		const missingLocation = { id: 'missing-location' };
		mocks.findLocation.mockResolvedValue(null);

		await expect(renderPage(missingLocation.id)).rejects.toThrow(
			'NEXT_NOT_FOUND',
		);
		expect(mocks.notFound).toHaveBeenCalledOnce();
	});

	it('shows location context and passes editable values and actions to the form', async () => {
		mocks.findLocation.mockResolvedValue(location);

		render(await renderPage(location.id));
		const formProps = mocks.locationForm.mock.calls[0][0];

		expect(
			screen
				.getByRole('link', { name: locationsText.title })
				.getAttribute('href'),
		).toBe('/locations');
		expect(screen.getByText(editLocationFormText.title)).toBeDefined();
		expect(
			screen.getByText(editLocationFormText.description(location.name)),
		).toBeDefined();
		expect(formProps).toMatchObject({
			defaultValues: {
				type: location.type,
				name: location.name,
				addressLine1: location.addressLine1,
				addressLine2: '',
				city: location.city,
				state: location.state,
				postalCode: location.postalCode,
			},
			submitLabel: editLocationFormText.submit,
			cancelHref: '/locations',
		});
		expect(mocks.deleteLocationButton).toHaveBeenCalledWith(
			{ locationId: location.id },
			undefined,
		);

		const state: LocationFormState = { message: '', errors: {} };
		const formData = new FormData();
		await formProps.action(state, formData);
		expect(mocks.editLocationAction).toHaveBeenCalledWith(
			location.id,
			state,
			formData,
		);
	});
});
