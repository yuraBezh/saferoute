import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ redirect: vi.fn(), hasRole: vi.fn() }));

vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));
vi.mock('@/lib/auth/roles', () => ({ hasRole: mocks.hasRole }));

import Home from './page';

describe('Home', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.redirect.mockImplementation(() => {
			throw new Error('NEXT_REDIRECT');
		});
	});

	it('redirects a parent to the children page', async () => {
		mocks.hasRole.mockResolvedValue(true);

		await expect(Home()).rejects.toThrow();

		expect(mocks.redirect).toHaveBeenCalledWith('/children');
		expect(mocks.redirect).toHaveBeenCalledOnce();
	});

	it('redirects a caregiver to the caregiver page', async () => {
		mocks.hasRole.mockResolvedValue(false);

		await expect(Home()).rejects.toThrow();

		expect(mocks.redirect).toHaveBeenCalledWith('/caregiver');
		expect(mocks.redirect).toHaveBeenCalledOnce();
	});
});
