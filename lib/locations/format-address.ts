type AddressParts = {
	addressLine1: string;
	addressLine2: string | null;
	city: string;
	state: string;
	postalCode: string;
};

export function formatAddress({
	addressLine1,
	addressLine2,
	city,
	state,
	postalCode,
}: AddressParts) {
	return [addressLine1, addressLine2, `${city}, ${state} ${postalCode}`]
		.filter(Boolean)
		.join(', ');
}
