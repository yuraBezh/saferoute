import { randomInt } from 'node:crypto';

export const generatePickupPin = (): string => String(randomInt(0, 1000000)).padStart(6, '0');
