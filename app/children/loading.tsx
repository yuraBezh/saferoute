import { PageContainer } from '@/components/ui/page-container';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<PageContainer>
			<div className="mb-5 flex items-center justify-between gap-4">
				<div className="space-y-2">
					<Skeleton className="h-7 w-32" />
					<Skeleton className="h-4 w-24" />
				</div>
				<Skeleton className="h-9 w-28" />
			</div>

			<div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
				{[0, 1, 2].map((item) => (
					<div key={item} className="flex items-center gap-4 px-5 py-4">
						<Skeleton className="size-10 shrink-0 rounded-full" />
						<div className="min-w-0 flex-1 space-y-2">
							<Skeleton className="h-4 w-36" />
							<Skeleton className="h-3 w-48" />
						</div>
					</div>
				))}
			</div>
		</PageContainer>
	);
}
