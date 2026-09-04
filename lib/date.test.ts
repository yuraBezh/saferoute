import { describe, expect, it } from 'vitest';
import { fromUtc, shiftDateByDays, toUtc } from '@/lib/date';

const timeZoneFixture = 'America/Chicago';

describe('zoned date and time conversion', () => {
	it.each([
		{ date: '2026-03-07', expected: '2026-03-07T21:30:00.000Z' },
		{ date: '2026-03-08', expected: '2026-03-08T20:30:00.000Z' },
		{ date: '2026-10-31', expected: '2026-10-31T20:30:00.000Z' },
		{ date: '2026-11-01', expected: '2026-11-01T21:30:00.000Z' },
	])('converts $date across Houston daylight-saving transitions', ({ date, expected }) => {
		expect(toUtc(date, '15:30', timeZoneFixture).toISOString()).toBe(expected);
	});

	it('converts a UTC instant back to pickup-local form values', () => {
		const instantFixture = new Date('2026-09-15T20:30:00.000Z');

		expect(fromUtc(instantFixture, timeZoneFixture)).toEqual({
			date: '2026-09-15',
			time: '15:30',
		});
	});
});

describe('calendar date arithmetic', () => {
	it('shifts a date across the end of the year', () => {
		expect(shiftDateByDays('2026-12-31', 30)).toBe('2027-01-30');
	});
});
