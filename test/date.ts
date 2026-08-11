export function dateFromToday({
	years = 0,
	days = 0,
}: {
	years?: number;
	days?: number;
} = {}) {
	const date = new Date();

	date.setUTCFullYear(date.getUTCFullYear() + years);
	date.setUTCDate(date.getUTCDate() + days);

	return date.toISOString().slice(0, 10);
}
