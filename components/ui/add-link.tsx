import Link from 'next/link';
import type { ComponentProps } from 'react';
import { PlusIcon } from '@/components/ui/icons';

type AddLinkProps = Pick<ComponentProps<typeof Link>, 'href' | 'children'>;

export const AddLink = ({ href, children }: AddLinkProps) => (
	<Link
		href={href}
		className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
	>
		<PlusIcon />
		{children}
	</Link>
);
