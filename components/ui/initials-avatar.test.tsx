import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InitialsAvatar } from './initials-avatar';

describe('InitialsAvatar', () => {
	const initialsFixture = 'JK';

	it('shows the provided initials', () => {
		render(<InitialsAvatar initials={initialsFixture} />);

		expect(screen.getByText(initialsFixture)).toBeDefined();
	});
});
