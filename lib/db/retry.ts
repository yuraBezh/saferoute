const SERIALIZATION_FAILURE = '40001';
const PRISMA_TRANSACTION_CONFLICT = 'P2034';

export function hasDatabaseErrorCode(error: unknown, expectedCode: string): boolean {
	if (!error || typeof error !== 'object') return false;
	if ('code' in error && error.code === expectedCode) return true;
	if ('originalCode' in error && error.originalCode === expectedCode) return true;
	if ('meta' in error && hasDatabaseErrorCode(error.meta, expectedCode)) return true;
	if (
		'driverAdapterError' in error &&
		hasDatabaseErrorCode(error.driverAdapterError, expectedCode)
	) {
		return true;
	}
	if ('cause' in error && hasDatabaseErrorCode(error.cause, expectedCode)) return true;

	return false;
}

export function isSerializationFailure(error: unknown): boolean {
	if (!error || typeof error !== 'object') return false;

	return (
		('code' in error && error.code === PRISMA_TRANSACTION_CONFLICT) ||
		hasDatabaseErrorCode(error, SERIALIZATION_FAILURE)
	);
}

export async function withSerializableRetry<T>(
	operation: () => Promise<T>,
	attempts = 3,
): Promise<T> {
	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			return await operation();
		} catch (error) {
			if (attempt === attempts || !isSerializationFailure(error)) {
				throw error;
			}
		}
	}

	throw new Error('unreachable');
}
