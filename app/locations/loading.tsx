import { PageContainer } from '@/components/ui/page-container';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<PageContainer>
			<div className="mb-8 flex items-start justify-between gap-4">
				<div className="space-y-2">
					<Skeleton className="h-7 w-32" />
					<Skeleton className="h-4 w-64" />
				</div>
				<Skeleton className="h-9 w-32" />
			</div>

			<div className="space-y-8">
				{[0, 1].map((section) => (
					<section key={section}>
						<Skeleton className="mb-3 h-4 w-20" />
						<div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
							{[0, 1].map((item) => (
								<div key={item} className="flex items-center gap-4 px-5 py-4">
									<Skeleton className="size-10 shrink-0 rounded-lg" />
									<div className="min-w-0 flex-1 space-y-2">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-3 w-48" />
									</div>
								</div>
							))}
						</div>
					</section>
				))}
			</div>
		</PageContainer>
	);
}
