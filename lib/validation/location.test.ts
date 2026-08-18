import { describe, expect, it } from 'vitest';
import { LocationType } from '@/generated/prisma/enums';
import { locationFormText } from '@/lib/content/location-form-text';
import { locationSchema } from '@/lib/validation/location';

const validLocation = {
	type: LocationType.HOME,
	name: "Anna's Home",
	addressLine1: '1515 Austin St',
	addressLine2: '',
	city: 'Houston',
	state: 'TX',
	postalCode: '77002',
};

describe('locationSchema', () => {
	it('accepts a valid five-digit ZIP code', () => {
		const result = locationSchema.safeParse(validLocation);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.postalCode).toBe(validLocation.postalCode);
		}
	});

	it('accepts a valid ZIP+4 code', () => {
		const location = { ...validLocation, postalCode: '77002-1234' };
		const result = locationSchema.safeParse(location);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.postalCode).toBe(location.postalCode);
		}
	});

	it('rejects a four-digit ZIP code', () => {
		const location = { ...validLocation, postalCode: '7700' };
		const result = locationSchema.safeParse(location);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.postalCode).toContain(
				locationFormText.fields.postalCode.invalid,
			);
		}
	});

	it('rejects an unsupported state code', () => {
		const location = { ...validLocation, state: 'XX' };
		const result = locationSchema.safeParse(location);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.state).toContain(
				locationFormText.fields.state.invalid,
			);
		}
	});

	it('normalizes a lowercase state code', () => {
		const state = { input: 'tx', output: 'TX' } as const;
		const result = locationSchema.safeParse({
			...validLocation,
			state: state.input,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.state).toBe(state.output);
		}
	});

	it('rejects a location type outside the enum', () => {
		const location = { ...validLocation, type: 'OFFICE' };
		const result = locationSchema.safeParse(location);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.type).toContain(
				locationFormText.fields.type.invalid,
			);
		}
	});

	it('rejects an empty location name', () => {
		const location = { ...validLocation, name: '   ' };
		const result = locationSchema.safeParse(location);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.name).toContain(
				locationFormText.fields.name.required,
			);
		}
	});

	it('normalizes an empty addressLine2 to undefined', () => {
		const result = locationSchema.safeParse(validLocation);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.addressLine2).toBeUndefined();
		}
	});

	it('accepts a missing addressLine2', () => {
		const { addressLine2: _addressLine2, ...location } = validLocation;
		const result = locationSchema.safeParse(location);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.addressLine2).toBeUndefined();
		}
	});
});
