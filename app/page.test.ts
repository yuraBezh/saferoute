import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

import Home from './page';

describe('Home', () => {
	it('redirects to the children page', () => {
		Home();

		expect(mocks.redirect).toHaveBeenCalledWith('/children');
	});
});
