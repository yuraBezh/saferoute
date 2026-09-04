const Skeleton = ({ className }: { className: string }) => (
	<div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

export default function BookingDetailsLoading() {
	return (
		<main className="mx-auto w-full max-w-4xl px-6 py-10">
			<Skeleton className="mb-5 h-5 w-24" />
			<section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
				<div className="flex items-start justify-between border-b border-gray-200 p-6">
					<div className="space-y-3">
						<Skeleton className="h-7 w-48" />
						<Skeleton className="h-4 w-64" />
					</div>
					<Skeleton className="h-9 w-32" />
				</div>
				<div className="grid gap-8 p-6 sm:grid-cols-2">
					<div className="space-y-5">
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-11 w-48" />
						<Skeleton className="h-11 w-44" />
					</div>
					<div className="space-y-4">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>
			</section>
		</main>
	);
}
