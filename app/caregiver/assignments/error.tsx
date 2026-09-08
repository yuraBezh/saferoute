'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/ui/page-container';
import { assignmentsText } from '@/lib/content/assignments-text';

const { title, description, retry: retryLabel } = assignmentsText.error;

type AssignmentsErrorProps = {
	error: Error & { digest?: string };
	retry: () => void;
};

export default function AssignmentsError({ error, retry }: AssignmentsErrorProps) {
	useEffect(() => console.error(error), [error]);

	return (
		<PageContainer>
			<section className="rounded-xl border border-red-200 bg-red-50 p-6">
				<h1 className="text-lg font-semibold text-red-900">{title}</h1>
				<p className="mt-1 mb-5 text-sm text-red-800">{description}</p>
				<Button onClick={retry} variant="danger">
					{retryLabel}
				</Button>
			</section>
		</PageContainer>
	);
}
