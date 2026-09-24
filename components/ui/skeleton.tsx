import type { ReactNode } from 'react';
import { PageContainer } from '@/components/ui/page-container';

export function Skeleton({ className }: { className: string }) {
	return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

export function PageHeaderSkeleton({
	className = 'mb-8',
	titleWidth,
	descriptionWidth,
	action,
}: {
	className?: string;
	titleWidth: string;
	descriptionWidth: string;
	action?: ReactNode;
}) {
	return (
		<div className={`${className} flex items-start justify-between gap-4`}>
			<div className="space-y-1">
				<Skeleton className={`h-9 ${titleWidth}`} />
				<Skeleton className={`h-6 ${descriptionWidth}`} />
			</div>
			{action}
		</div>
	);
}

export function FormFieldSkeleton() {
	return (
		<div className="space-y-1.5">
			<Skeleton className="h-4 w-24" />
			<Skeleton className="h-10 w-full" />
		</div>
	);
}

export function FormPageSkeleton({
	backLink = true,
	description = true,
	fields,
	deleteButton = false,
}: {
	backLink?: boolean;
	description?: boolean;
	fields: number;
	deleteButton?: boolean;
}) {
	return (
		<PageContainer size="form">
			{backLink && <Skeleton className="mb-5 h-5 w-28" />}
			<header className="mb-5 space-y-2">
				<Skeleton className="h-7 w-40" />
				{description && <Skeleton className="h-4 w-56" />}
			</header>
			<div className="space-y-5 overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
				{Array.from({ length: fields }, (_, index) => (
					<FormFieldSkeleton key={index} />
				))}
				<div className={`flex gap-3 ${deleteButton ? 'justify-between' : 'justify-end'}`}>
					{deleteButton && <Skeleton className="h-10 w-24" />}
					<div className="flex gap-3">
						<Skeleton className="h-10 w-24" />
						<Skeleton className="h-10 w-32" />
					</div>
				</div>
			</div>
		</PageContainer>
	);
}
