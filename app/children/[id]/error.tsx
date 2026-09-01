'use client';

import childDetailsText from '@/lib/content/child-details-text';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

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
					<Button onClick={reset} variant="danger">
						{childDetailsText.error.retry}
					</Button>
				</section>
			</div>
		</main>
	);
}
