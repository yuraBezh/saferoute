import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dateFromToday } from '@/test/date';
import {
	childFormText,
	createChildFormText,
} from '@/lib/content/child-form-text';
import { ChildForm } from '@/components/child-form';

const {
	fields: {
		firstName: firstNameText,
		lastName: lastNameText,
		birthDate: birthDateText,
	},
} = childFormText;
const { saveError, submit, submitting } = createChildFormText;

const mocks = vi.hoisted(() => ({
	childFormAction: vi.fn(),
}));

const childFormProps = {
	formAction: mocks.childFormAction,
	submitLabel: submit,
	submittingLabel: submitting,
};

describe('ChildForm', () => {
	beforeEach(() => {
		mocks.childFormAction.mockReset();
	});

	it('renders all form controls', () => {
		render(<ChildForm {...childFormProps} />);

		expect(
			screen.getByRole('textbox', { name: firstNameText.label }),
		).toBeDefined();
		expect(
			screen.getByRole('textbox', { name: lastNameText.label }),
		).toBeDefined();
		expect(screen.getByLabelText(birthDateText.label)).toBeDefined();
		expect(screen.getByRole('button', { name: submit })).toBeDefined();
	});

	it('prefills editable values and links cancel to the provided page', () => {
		const child = {
			firstName: 'John',
			lastName: 'Krasinski',
			birthDate: '2010-01-01',
		};
		const cancelHref = '/children/child-1';

		render(
			<ChildForm
				{...childFormProps}
				defaultValues={child}
				cancelHref={cancelHref}
			/>,
		);

		expect(
			(screen.getByLabelText(firstNameText.label) as HTMLInputElement).value,
		).toBe(child.firstName);
		expect(
			(screen.getByLabelText(lastNameText.label) as HTMLInputElement).value,
		).toBe(child.lastName);
		expect(
			(screen.getByLabelText(birthDateText.label) as HTMLInputElement).value,
		).toBe(child.birthDate);
		expect(
			screen
				.getByRole('link', { name: childFormText.cancel })
				.getAttribute('href'),
		).toBe(cancelHref);
	});

	it('keeps names when the birth date is invalid', async () => {
		mocks.childFormAction.mockResolvedValue({
			message: '',
			errors: { birthDate: [birthDateText.future] },
		});
		const { container } = render(<ChildForm {...childFormProps} />);
		const firstName = screen.getByRole('textbox', {
			name: firstNameText.label,
		}) as HTMLInputElement;
		const lastName = screen.getByRole('textbox', {
			name: lastNameText.label,
		}) as HTMLInputElement;
		const birthDate = screen.getByLabelText(
			birthDateText.label,
		) as HTMLInputElement;

		fireEvent.change(firstName, { target: { value: 'Miles' } });
		fireEvent.change(lastName, { target: { value: 'Davis' } });
		fireEvent.change(birthDate, {
			target: { value: dateFromToday({ days: 1 }) },
		});
		fireEvent.submit(container.querySelector('form')!);

		await screen.findByText(birthDateText.future);
		expect(firstName.value).toBe('Miles');
		expect(lastName.value).toBe('Davis');
		expect(birthDate.getAttribute('aria-invalid')).toBe('true');
	});

	it('shows a general save error', async () => {
		mocks.childFormAction.mockResolvedValue({
			message: saveError,
			errors: {},
		});
		const { container } = render(<ChildForm {...childFormProps} />);

		fireEvent.submit(container.querySelector('form')!);

		const error = await screen.findByText(saveError);
		expect(error.getAttribute('aria-live')).toBe('polite');
	});

	it('disables the button while submitting', async () => {
		let resolveAction!: (state: { message: string; errors: object }) => void;
		mocks.childFormAction.mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveAction = resolve;
				}),
		);
		const { container } = render(<ChildForm {...childFormProps} />);

		fireEvent.submit(container.querySelector('form')!);

		await waitFor(() => {
			const button = screen.getByRole('button', {
				name: submitting,
			}) as HTMLButtonElement;
			expect(button.disabled).toBe(true);
		});

		resolveAction({ message: '', errors: {} });
		await waitFor(() => {
			expect(screen.getByRole('button', { name: submit })).toBeDefined();
		});
	});
});
