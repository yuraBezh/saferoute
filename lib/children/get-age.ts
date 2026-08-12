export function getAge(birthDate: Date) {
	const today = new Date();
	let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
	const birthdayHasPassed =
		today.getUTCMonth() > birthDate.getUTCMonth() ||
		(today.getUTCMonth() === birthDate.getUTCMonth() &&
			today.getUTCDate() >= birthDate.getUTCDate());

	if (!birthdayHasPassed) age -= 1;

	return age;
}
