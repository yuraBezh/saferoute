export function toCents(dollars: string): number {
	const [whole, fraction = ''] = dollars.split('.');
	return Number(whole) * 100 + Number(fraction.padEnd(2, '0').slice(0, 2));
}

export function fromCents(cents: number): string {
	return (cents / 100).toFixed(2);
}
