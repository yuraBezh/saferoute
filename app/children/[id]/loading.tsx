function Skeleton({ className }: { className: string }) {
	return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

export default function Loading() {
	return (
		<main className="min-h-screen bg-white px-3 py-5 sm:px-6 sm:py-8">
			<div className="mx-auto w-full max-w-4xl">
				<Skeleton className="mb-4 h-5 w-24" />

				<section className="rounded-xl border border-gray-200 bg-white px-5 py-5 shadow-sm sm:px-6">
					<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-4">
							<Skeleton className="size-12 shrink-0 rounded-full" />
							<div className="space-y-2">
								<Skeleton className="h-6 w-44" />
								<Skeleton className="h-4 w-24" />
							</div>
						</div>

						<div className="flex gap-3">
							<Skeleton className="h-9 w-20" />
							<Skeleton className="h-9 w-24" />
						</div>
					</div>

					<hr className="my-5 border-gray-200" />

					<div className="space-y-3">
						<div className="flex justify-between gap-6">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-32" />
						</div>
						<div className="flex justify-between gap-6">
							<Skeleton className="h-4 w-14" />
							<Skeleton className="h-4 w-32" />
						</div>
					</div>
				</section>

				<section className="mt-4">
					<Skeleton className="mb-3 h-6 w-24" />
					<div className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
						{[0, 1].map((item) => (
							<div
								key={item}
								className="flex items-center justify-between gap-4 px-4 py-4"
							>
								<div className="space-y-2">
									<Skeleton className="h-5 w-36" />
									<Skeleton className="h-4 w-52" />
								</div>
								<Skeleton className="h-6 w-20 rounded-full" />
							</div>
						))}
					</div>
				</section>
			</div>
		</main>
	);
}
