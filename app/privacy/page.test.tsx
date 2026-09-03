import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { privacyText } from '@/lib/content/privacy-text';
import PrivacyPage from './page';

const { title, lines } = privacyText;

describe('PrivacyPage', () => {
	it('explains how SafeRoute handles personal information in ten statements', () => {
		render(<PrivacyPage />);

		expect(screen.getByRole('heading', { name: title })).toBeDefined();
		expect(lines).toHaveLength(10);
		for (const line of lines) {
			expect(screen.getByText(line)).toBeDefined();
		}
	});
});
