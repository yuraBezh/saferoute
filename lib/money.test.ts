import { describe, expect, it } from 'vitest';
import { fromCents, toCents } from './money';

describe('money conversion', () => {
	it('converts dollar input to integer cents', () => {
		expect(toCents('12.34')).toBe(1234);
	});

	it('pads a single fractional digit', () => {
		expect(toCents('12.5')).toBe(1250);
	});

	it('converts integer cents to a two-decimal dollar value', () => {
		expect(fromCents(1234)).toBe('12.34');
	});
});
