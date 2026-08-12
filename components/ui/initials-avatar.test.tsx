import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InitialsAvatar } from './initials-avatar';

describe('InitialsAvatar', () => {
	const initialsFixture = 'JK';

	it('shows the provided initials', () => {
		render(<InitialsAvatar initials={initialsFixture} />);

		expect(screen.getByText(initialsFixture)).toBeDefined();
	});

	it('uses the medium size by default', () => {
		render(<InitialsAvatar initials={initialsFixture} />);

		expect(
			screen.getByText(initialsFixture).classList.contains('size-12'),
		).toBe(true);
	});

	it('supports the small size', () => {
		render(<InitialsAvatar initials={initialsFixture} size="sm" />);

		expect(
			screen.getByText(initialsFixture).classList.contains('size-10'),
		).toBe(true);
	});
});
