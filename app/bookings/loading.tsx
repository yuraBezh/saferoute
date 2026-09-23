import { PageContainer } from '@/components/ui/page-container';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<PageContainer>
			<div className="mb-6 flex items-start justify-between gap-4">
				<div className="space-y-2">
					<Skeleton className="h-7 w-28" />
					<Skeleton className="h-4 w-56" />
					<Skeleton className="h-3 w-20" />
				</div>
				<Skeleton className="h-9 w-32" />
			</div>

			<div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
				{[0, 1, 2].map((item) => (
					<div
						key={item}
						className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(9rem,0.8fr)_minmax(13rem,1fr)_minmax(0,1.5fr)_auto] sm:items-center"
					>
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-4 w-36" />
						<Skeleton className="h-4 w-44" />
						<Skeleton className="h-6 w-20 justify-self-end rounded-full" />
					</div>
				))}
			</div>
		</PageContainer>
	);
}
