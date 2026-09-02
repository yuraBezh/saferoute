import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CaregiverForm } from './caregiver-form';
import { caregiverText } from '@/lib/content/caregiver-text';

const mocks = vi.hoisted(() => ({ action: vi.fn() }));

const valuesFixture = {
	bio: 'Experienced caregiver',
	hourlyRate: '25.50',
	vehicleMake: 'Honda',
	vehicleModel: 'Odyssey',
	vehicleYear: '2022',
	vehicleColor: 'Blue',
	licensePlate: 'SAFE-123',
};
const propsFixture = {
	action: mocks.action,
	submitLabel: caregiverText.onboarding.submit,
	cancelHref: '/children',
};

describe('CaregiverForm', () => {
	beforeEach(() => mocks.action.mockReset());

	it('renders every profile field', () => {
		render(<CaregiverForm {...propsFixture} />);

		for (const field of Object.values(caregiverText.fields)) {
			expect(screen.getByLabelText(field.label, { exact: false })).toBeDefined();
		}
		expect(screen.getByRole('button', { name: propsFixture.submitLabel })).toBeDefined();
		expect(screen.getByRole('link', { name: caregiverText.cancel }).getAttribute('href')).toBe(
			propsFixture.cancelHref,
		);
	});

	it('prefills values for profile editing', () => {
		render(<CaregiverForm {...propsFixture} defaultValues={valuesFixture} />);

		for (const [field, value] of Object.entries(valuesFixture)) {
			expect(
				(
					screen.getByLabelText(
						caregiverText.fields[field as keyof typeof caregiverText.fields].label,
						{ exact: false },
					) as HTMLInputElement
				).value,
			).toBe(value);
		}
	});

	it('exposes validation errors accessibly', async () => {
		mocks.action.mockResolvedValue({
			message: caregiverText.validationError,
			errors: { bio: [caregiverText.fields.bio.invalid] },
		});
		const { container } = render(<CaregiverForm {...propsFixture} />);
		const bio = screen.getByLabelText(caregiverText.fields.bio.label, {
			exact: false,
		}) as HTMLTextAreaElement;

		fireEvent.submit(container.querySelector('form')!);

		await screen.findByText(caregiverText.fields.bio.invalid);
		expect(bio.getAttribute('aria-invalid')).toBe('true');
		expect(bio.getAttribute('aria-describedby')).toBe('bio-error');
	});
});
