import Link from 'next/link';
import type { ComponentProps } from 'react';
import { ArrowLeftIcon } from '@/components/ui/icons';

const baseClasses =
	'inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-950';

type BackLinkProps = ComponentProps<typeof Link>;

export function BackLink({
	className = '',
	children,
	...props
}: BackLinkProps) {
	return (
		<Link {...props} className={`${baseClasses} ${className}`}>
			<ArrowLeftIcon />
			{children}
		</Link>
	);
}
