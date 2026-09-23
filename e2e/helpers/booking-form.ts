import type { Page } from '@playwright/test';
import { bookingFormText } from '@/lib/content/booking-form-text';

const {
	fields: {
		childId: childField,
		date: dateField,
		time: timeField,
		pickupLocationId: pickupField,
		activityLocationId: activityField,
		dropoffLocationId: dropoffField,
		estimatedDurationMin: durationField,
		notes: notesField,
	},
	submit,
} = bookingFormText;

export async function submitBookingForm(
	page: Page,
	params: {
		childFullName: string;
		date: string;
		time: string;
		pickupLocationName: string;
		dropoffLocationName: string;
		activityLocationName?: string;
		durationMin: string;
		notes?: string;
	},
) {
	await page.goto('/bookings/new');
	await page.getByLabel(childField.label).selectOption({ label: params.childFullName });
	await page.getByLabel(dateField.label).fill(params.date);
	await page.getByLabel(timeField.label).fill(params.time);
	await page.getByLabel(pickupField.label).selectOption({ label: params.pickupLocationName });
	if (params.activityLocationName) {
		await page
			.getByLabel(activityField.label, { exact: false })
			.selectOption({ label: params.activityLocationName });
	}
	await page.getByLabel(dropoffField.label).selectOption({ label: params.dropoffLocationName });
	await page.getByLabel(durationField.label).selectOption(params.durationMin);
	if (params.notes) {
		await page.getByLabel(notesField.label, { exact: false }).fill(params.notes);
	}
	await page.getByRole('button', { name: submit }).click();
}
