'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/ui/page-container';
import { genericPageError } from '@/lib/content/error-text';

type RouteErrorProps = {
	error: Error & { digest?: string };
	retry: () => void;
};

export const GenericPageError = ({ error, retry }: RouteErrorProps) => (
	<PageErrorState
		error={error}
		retry={retry}
		title={genericPageError.title}
		description={genericPageError.description}
		retryLabel={genericPageError.retry}
	/>
);

export const GenericFormError = ({ error, retry }: RouteErrorProps) => (
	<PageErrorState
		error={error}
		retry={retry}
		title={genericPageError.title}
		description={genericPageError.description}
		retryLabel={genericPageError.retry}
		size="form"
	/>
);

type PageErrorStateProps = {
	error: Error & { digest?: string };
	retry: () => void;
	title: string;
	description?: string;
	retryLabel: string;
	size?: 'content' | 'form';
};

export function PageErrorState({
	error,
	retry,
	title,
	description,
	retryLabel,
	size = 'content',
}: PageErrorStateProps) {
	useEffect(() => console.error(error), [error]);

	return (
		<PageContainer size={size}>
			<section className="rounded-xl border border-red-200 bg-red-50 p-6">
				<h1 className="text-lg font-semibold text-red-900">{title}</h1>
				{description && <p className="mt-1 mb-5 text-sm text-red-800">{description}</p>}
				<Button onClick={retry} variant="danger" className={description ? undefined : 'mt-5'}>
					{retryLabel}
				</Button>
			</section>
		</PageContainer>
	);
}
