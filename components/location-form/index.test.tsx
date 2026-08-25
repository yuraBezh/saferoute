import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocationType } from '@/generated/prisma/enums';
import {
	createLocationFormText,
	locationFormText,
} from '@/lib/content/location-form-text';
import { LocationForm } from '@/components/location-form';

const {
	cancel,
	fields: {
		type: typeText,
		name: nameText,
		addressLine1: addressLine1Text,
		addressLine2: addressLine2Text,
		city: cityText,
		state: stateText,
		postalCode: postalCodeText,
	},
} = locationFormText;

const mocks = vi.hoisted(() => ({
	locationFormAction: vi.fn(),
}));

const locationFormProps = {
	action: mocks.locationFormAction,
	submitLabel: createLocationFormText.submit,
};
const location = {
	type: LocationType.SCHOOL,
	name: 'Lincoln Elementary',
	addressLine1: '123 Main St',
	addressLine2: 'Suite 2',
	city: 'Chicago',
	state: 'IL',
	postalCode: '60601',
};
const locationControls = [
	{ field: 'type', role: 'combobox', name: typeText.label },
	{ field: 'name', role: 'textbox', name: nameText.label },
	{ field: 'addressLine1', role: 'textbox', name: addressLine1Text.label },
	{
		field: 'addressLine2',
		role: 'textbox',
		name: `${addressLine2Text.label}${locationFormText.optional}`,
	},
	{ field: 'city', role: 'textbox', name: cityText.label },
	{ field: 'state', role: 'combobox', name: stateText.label },
	{ field: 'postalCode', role: 'textbox', name: postalCodeText.label },
] as const;

describe('LocationForm', () => {
	beforeEach(() => {
		mocks.locationFormAction.mockReset();
	});

	it('renders every location control', () => {
		render(<LocationForm {...locationFormProps} />);

		for (const { role, name } of locationControls) {
			expect(screen.getByRole(role, { name })).toBeDefined();
		}
		expect(
			screen.getByRole('button', { name: createLocationFormText.submit }),
		).toBeDefined();
	});

	it('prefills editable values and links cancel to the provided page', () => {
		const cancelHref = '/locations';

		render(
			<LocationForm
				{...locationFormProps}
				defaultValues={location}
				cancelHref={cancelHref}
			/>,
		);

		for (const { field, role, name } of locationControls) {
			const control = screen.getByRole(role, { name }) as HTMLInputElement;
			expect(control.value).toBe(location[field]);
		}
		expect(
			screen.getByRole('link', { name: cancel }).getAttribute('href'),
		).toBe(cancelHref);
	});

	it('updates every controlled field', () => {
		render(<LocationForm {...locationFormProps} />);
		const controls = locationControls.map(({ field, role, name }) => ({
			field,
			control: screen.getByRole(role, { name }) as HTMLInputElement,
		}));

		for (const { field, control } of controls) {
			fireEvent.change(control, {
				target: { value: location[field] },
			});
		}

		for (const { field, control } of controls) {
			expect(control.value).toBe(location[field]);
		}
	});

	it('keeps entered values and marks an invalid field after an action error', async () => {
		mocks.locationFormAction.mockResolvedValue({
			message: locationFormText.validationError,
			errors: { state: [stateText.invalid] },
		});
		const { container } = render(<LocationForm {...locationFormProps} />);
		const name = screen.getByLabelText(nameText.label) as HTMLInputElement;
		const state = screen.getByLabelText(stateText.label) as HTMLSelectElement;

		fireEvent.change(name, { target: { value: location.name } });
		fireEvent.submit(container.querySelector('form')!);

		await screen.findByText(stateText.invalid);
		expect(name.value).toBe(location.name);
		expect(state.value).toBe('');
		expect(state.getAttribute('aria-invalid')).toBe('true');
		expect(state.getAttribute('aria-describedby')).toBe('state-error');
	});

	it('announces a general save error', async () => {
		mocks.locationFormAction.mockResolvedValue({
			message: createLocationFormText.saveError,
			errors: {},
		});
		const { container } = render(<LocationForm {...locationFormProps} />);

		fireEvent.submit(container.querySelector('form')!);

		const error = await screen.findByText(createLocationFormText.saveError);
		expect(error.getAttribute('aria-live')).toBe('polite');
	});
});
