import { PageContainer } from '@/components/ui/page-container';
import { PageHeaderSkeleton, Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<PageContainer>
			<PageHeaderSkeleton
				className="mb-5"
				titleWidth="w-32"
				descriptionWidth="w-56"
				action={<Skeleton className="h-10 w-32" />}
			/>
			<div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
				{[0, 1, 2].map((item) => (
					<div key={item} className="flex items-center gap-4 px-5 py-4">
						<Skeleton className="size-10 shrink-0 rounded-full" />
						<div className="min-w-0 flex-1">
							<Skeleton className="h-6 w-36" />
							<Skeleton className="h-5 w-48" />
						</div>
						<Skeleton className="size-5 shrink-0" />
					</div>
				))}
			</div>
		</PageContainer>
	);
}
