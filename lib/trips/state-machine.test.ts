import { describe, expect, it } from 'vitest';
import { TripStatus } from '@/generated/prisma/enums';
import { canTransition, getAvailableTransitions } from './state-machine';

const {
	SCHEDULED,
	EN_ROUTE_TO_SCHOOL,
	CHILD_PICKED_UP,
	AT_ACTIVITY,
	EN_ROUTE_HOME,
	COMPLETED,
	CANCELLED,
} = TripStatus;

describe('canTransition', () => {
	it('allows the caregiver to start the trip', () => {
		expect(canTransition(SCHEDULED, EN_ROUTE_TO_SCHOOL, 'CAREGIVER')).toBe(true);
	});

	it('allows cancelling before the child is picked up', () => {
		expect(canTransition(SCHEDULED, CANCELLED, 'CAREGIVER')).toBe(true);
		expect(canTransition(EN_ROUTE_TO_SCHOOL, CANCELLED, 'GUARDIAN')).toBe(true);
	});

	it('forbids cancelling once the child is picked up', () => {
		expect(canTransition(CHILD_PICKED_UP, CANCELLED, 'CAREGIVER')).toBe(false);
	});

	it('forbids any transition out of COMPLETED', () => {
		for (const status of Object.values(TripStatus)) {
			expect(canTransition(COMPLETED, status, 'CAREGIVER')).toBe(false);
		}
	});

	it('forbids the guardian from advancing the trip', () => {
		expect(canTransition(SCHEDULED, EN_ROUTE_TO_SCHOOL, 'GUARDIAN')).toBe(false);
	});

	it('forbids a transition to the same status', () => {
		expect(canTransition(SCHEDULED, SCHEDULED, 'CAREGIVER')).toBe(false);
	});
});

describe('getAvailableTransitions', () => {
	it('offers two options after pickup', () => {
		expect(getAvailableTransitions(CHILD_PICKED_UP, 'CAREGIVER')).toEqual([
			AT_ACTIVITY,
			EN_ROUTE_HOME,
		]);
	});

	it.each([COMPLETED, CANCELLED])('offers nothing from the terminal status %s', (status) => {
		expect(getAvailableTransitions(status, 'CAREGIVER')).toEqual([]);
	});
});
