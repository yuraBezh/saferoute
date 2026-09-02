import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UserRole } from '@/generated/prisma/enums';
import { caregiverText } from '@/lib/content/caregiver-text';

const mocks = vi.hoisted(() => ({ requireRole: vi.fn() }));

vi.mock('@/lib/auth/roles', () => ({ requireRole: mocks.requireRole }));

import AssignmentsPage from './page';

describe('AssignmentsPage', () => {
	it('shows the assignments placeholder to a caregiver', async () => {
		render(await AssignmentsPage());

		expect(mocks.requireRole).toHaveBeenCalledWith(UserRole.CAREGIVER);
		expect(screen.getByRole('heading', { name: caregiverText.assignments.title })).toBeDefined();
		expect(screen.getByText(caregiverText.assignments.description)).toBeDefined();
	});
});
