'use server';

import { signIn } from '@/auth';

export async function findCaregiverAction() {
	await signIn('google', { redirectTo: '/children' });
}

export async function becomeCaregiverAction() {
	await signIn('google', { redirectTo: '/caregiver/onboarding' });
}
