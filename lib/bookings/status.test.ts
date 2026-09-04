import { afterEach, describe, expect, it, vi } from 'vitest';
import { BookingStatus } from '@/generated/prisma/enums';
import { displayStatus } from './status';

const now = new Date('2026-09-05T12:00:00Z');

describe('displayStatus', () => {
	afterEach(() => vi.useRealTimers());

	it('displays an expired pending booking as expired', () => {
		vi.useFakeTimers();
		vi.setSystemTime(now);

		expect(
			displayStatus({
				status: BookingStatus.PENDING,
				expiresAt: new Date(now.getTime() - 1),
			}),
		).toBe(BookingStatus.EXPIRED);
	});

	it('keeps a pending booking pending until its expiry time passes', () => {
		vi.useFakeTimers();
		vi.setSystemTime(now);

		expect(displayStatus({ status: BookingStatus.PENDING, expiresAt: now })).toBe(
			BookingStatus.PENDING,
		);
	});

	it('does not replace a persisted terminal status', () => {
		vi.useFakeTimers();
		vi.setSystemTime(now);

		expect(
			displayStatus({
				status: BookingStatus.CANCELLED,
				expiresAt: new Date(now.getTime() - 1),
			}),
		).toBe(BookingStatus.CANCELLED);
	});
});
