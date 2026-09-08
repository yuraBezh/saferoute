import type { ReactNode } from 'react';

type AssignmentsSectionProps = {
	id: string;
	title: string;
	emptyMessage: string;
	isEmpty: boolean;
	children: ReactNode;
};

export const AssignmentsSection = ({
	id,
	title,
	emptyMessage,
	isEmpty,
	children,
}: AssignmentsSectionProps) => (
	<section aria-labelledby={id}>
		<h2 id={id} className="text-lg font-semibold text-gray-950">
			{title}
		</h2>

		{isEmpty ? (
			<p className="mt-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center text-sm text-gray-600">
				{emptyMessage}
			</p>
		) : (
			<ul className="mt-3 space-y-4">{children}</ul>
		)}
	</section>
);
