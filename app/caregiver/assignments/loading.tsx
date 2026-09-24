import { PageContainer } from '@/components/ui/page-container';
import { PageHeaderSkeleton, Skeleton } from '@/components/ui/skeleton';

function SectionSkeleton() {
	return (
		<section>
			<Skeleton className="h-5 w-40" />
			<div className="mt-3 space-y-4">
				{[0, 1].map((item) => (
					<div
						key={item}
						className="grid gap-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-[minmax(0,1fr)_minmax(15rem,1.15fr)_auto]"
					>
						<div className="space-y-2">
							<Skeleton className="h-5 w-24" />
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-20" />
						</div>
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-10 w-24" />
					</div>
				))}
			</div>
		</section>
	);
}

export default function Loading() {
	return (
		<PageContainer>
			<PageHeaderSkeleton titleWidth="w-44" descriptionWidth="w-96" />
			<div className="space-y-10">
				<SectionSkeleton />
				<SectionSkeleton />
			</div>
		</PageContainer>
	);
}
