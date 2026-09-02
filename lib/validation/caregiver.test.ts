import { describe, expect, it } from 'vitest';
import { caregiverText } from '@/lib/content/caregiver-text';
import { caregiverProfileSchema } from './caregiver';

const profileFixture = {
	bio: 'Experienced caregiver',
	hourlyRate: '25.50',
	vehicleMake: 'Honda',
	vehicleModel: 'Odyssey',
	vehicleYear: String(new Date().getFullYear() - 5),
	vehicleColor: 'Blue',
	licensePlate: 'SAFE-123',
};

describe('caregiver profile validation', () => {
	it('normalizes a valid caregiver profile', () => {
		expect(caregiverProfileSchema.parse(profileFixture)).toEqual({
			...profileFixture,
			vehicleYear: Number(profileFixture.vehicleYear),
		});
	});

	it('normalizes blank optional values to null', () => {
		const result = caregiverProfileSchema.parse({
			...profileFixture,
			bio: '',
			vehicleMake: '',
			vehicleModel: '',
			vehicleYear: '',
			vehicleColor: '',
			licensePlate: '',
		});

		expect(result).toMatchObject({
			bio: null,
			vehicleMake: null,
			vehicleModel: null,
			vehicleYear: null,
			vehicleColor: null,
			licensePlate: null,
		});
	});

	it.each(['4.99', '500.01', '20.999', 'free'])(
		'rejects an invalid hourly rate: %s',
		(hourlyRate) => {
			const result = caregiverProfileSchema.safeParse({ ...profileFixture, hourlyRate });

			expect(result.error?.issues[0]?.message).toBe(caregiverText.fields.hourlyRate.invalid);
		},
	);

	it('requires an hourly rate', () => {
		const result = caregiverProfileSchema.safeParse({ ...profileFixture, hourlyRate: '' });

		expect(result.error?.issues[0]?.message).toBe(caregiverText.fields.hourlyRate.required);
	});

	it.each([String(new Date().getFullYear() + 1), String(new Date().getFullYear() - 31)])(
		'rejects a vehicle year outside the supported range: %s',
		(vehicleYear) => {
			const result = caregiverProfileSchema.safeParse({ ...profileFixture, vehicleYear });

			expect(result.error?.issues[0]?.message).toBe(caregiverText.fields.vehicleYear.invalid);
		},
	);

	it('rejects an invalid license plate', () => {
		const result = caregiverProfileSchema.safeParse({ ...profileFixture, licensePlate: '!' });

		expect(result.error?.issues[0]?.message).toBe(caregiverText.fields.licensePlate.invalid);
	});
});
