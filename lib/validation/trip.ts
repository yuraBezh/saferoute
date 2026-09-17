import { z } from 'zod';

export const pinSchema = z
	.string()
	.trim()
	.regex(/^\d{6}$/);
