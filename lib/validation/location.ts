import * as z from 'zod';
import { LocationType } from '@/app/generated/prisma/enums';
import { locationFormText } from '@/lib/content/location-form-text';

export const US_STATE_CODES = [
	'AL',
	'AK',
	'AZ',
	'AR',
	'CA',
	'CO',
	'CT',
	'DE',
	'FL',
	'GA',
	'HI',
	'ID',
	'IL',
	'IN',
	'IA',
	'KS',
	'KY',
	'LA',
	'ME',
	'MD',
	'MA',
	'MI',
	'MN',
	'MS',
	'MO',
	'MT',
	'NE',
	'NV',
	'NH',
	'NJ',
	'NM',
	'NY',
	'NC',
	'ND',
	'OH',
	'OK',
	'OR',
	'PA',
	'RI',
	'SC',
	'SD',
	'TN',
	'TX',
	'UT',
	'VT',
	'VA',
	'WA',
	'WV',
	'WI',
	'WY',
	'DC',
] as const;

const { fields } = locationFormText;

export const locationSchema = z.object({
	type: z.enum(LocationType, { error: fields.type.invalid }),
	name: z
		.string({ error: fields.name.invalid })
		.trim()
		.min(1, { error: fields.name.required })
		.max(100),
	addressLine1: z
		.string({ error: fields.addressLine1.invalid })
		.trim()
		.min(1, { error: fields.addressLine1.required })
		.max(200),
	addressLine2: z
		.string()
		.trim()
		.max(200)
		.optional()
		.transform((value) => value || undefined)
		.optional(),
	city: z
		.string({ error: fields.city.invalid })
		.trim()
		.min(1, { error: fields.city.required })
		.max(100),
	state: z
		.string({ error: fields.state.invalid })
		.trim()
		.transform((value) => value.toUpperCase())
		.pipe(z.enum(US_STATE_CODES, { error: fields.state.invalid })),
	postalCode: z
		.string({ error: fields.postalCode.invalid })
		.trim()
		.regex(/^\d{5}(-\d{4})?$/, { error: fields.postalCode.invalid }),
});

// TODO: Derive the timezone from the address or coordinates before supporting
// locations outside the America/Chicago timezone. Prisma supplies today's default.

export type LocationInput = z.infer<typeof locationSchema>;
