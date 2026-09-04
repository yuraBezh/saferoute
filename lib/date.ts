import { fromZonedTime, toZonedTime } from 'date-fns-tz';

export const toDbDate = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

export const shiftDateByDays = (iso: string, days: number) => {
	const date = toDbDate(iso);
	date.setUTCDate(date.getUTCDate() + days);

	return date.toISOString().slice(0, 10);
};

export const toUtc = (date: string, time: string, timeZone: string) =>
	fromZonedTime(`${date}T${time}:00`, timeZone);

const padDatePart = (value: number) => String(value).padStart(2, '0');

export const fromUtc = (instant: Date, timeZone: string) => {
	const zonedDate = toZonedTime(instant, timeZone);
	const year = zonedDate.getFullYear();
	const month = padDatePart(zonedDate.getMonth() + 1);
	const day = padDatePart(zonedDate.getDate());
	const hours = padDatePart(zonedDate.getHours());
	const minutes = padDatePart(zonedDate.getMinutes());

	return {
		date: `${year}-${month}-${day}`,
		time: `${hours}:${minutes}`,
	};
};
