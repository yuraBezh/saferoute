import { PageContainer } from '@/components/ui/page-container';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<PageContainer>
			<div className="mb-8 flex items-start justify-between gap-4">
				<div className="space-y-2">
					<Skeleton className="h-7 w-32" />
					<Skeleton className="h-4 w-40" />
				</div>
				<Skeleton className="h-9 w-16" />
			</div>

			<div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
				<Skeleton className="h-4 w-full max-w-md" />
				<div className="grid gap-5 sm:grid-cols-2">
					<div className="space-y-2">
						<Skeleton className="h-3 w-16" />
						<Skeleton className="h-5 w-24" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-3 w-16" />
						<Skeleton className="h-5 w-32" />
					</div>
				</div>
			</div>

			<section className="mt-8">
				<Skeleton className="h-5 w-24" />
				<div className="mt-3 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
					{[0, 1].map((item) => (
						<div key={item} className="flex justify-between gap-4 px-4 py-3">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-20" />
						</div>
					))}
				</div>
			</section>
		</PageContainer>
	);
}
