import { PageContainer } from '@/components/ui/page-container';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<PageContainer>
			<Skeleton className="h-7 w-40" />
			<Skeleton className="mt-2 h-4 w-64" />
			<div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
				<section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
					<Skeleton className="h-3 w-24" />
					<Skeleton className="mt-2 h-7 w-40" />
					<Skeleton className="mt-8 mb-4 h-3 w-16" />
					<div className="space-y-3">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</section>
				<section className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
					<Skeleton className="h-3 w-32" />
					<div className="mt-5 flex flex-1 flex-col justify-end gap-3">
						<Skeleton className="h-11 w-full" />
					</div>
				</section>
			</div>
		</PageContainer>
	);
}
