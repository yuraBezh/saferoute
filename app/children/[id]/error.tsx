'use client';

import { childDetailsText } from '@/lib/content/child-details-text';
import { useEffect } from 'react';

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className="min-h-screen bg-white px-3 py-5 sm:px-6 sm:py-8">
			<div className="mx-auto w-full max-w-4xl">
				<section className="rounded-xl border border-red-200 bg-red-50 p-6">
					<h1 className="text-lg font-semibold text-red-900">
						{childDetailsText.error.title}
					</h1>
					<button
						type="button"
						onClick={reset}
						className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
					>
						{childDetailsText.error.retry}
					</button>
				</section>
			</div>
		</main>
	);
}
