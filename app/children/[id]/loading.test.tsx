import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Loading from './loading';

describe('ChildDetailsLoading', () => {
	it('renders an animated skeleton for the child details layout', () => {
		const { container } = render(<Loading />);
		const main = container.querySelector('main');
		const skeletons = container.querySelectorAll('.animate-pulse');

		expect(main).not.toBeNull();
		expect(skeletons.length).toBeGreaterThan(0);
	});
});
