'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';

type HeaderLinkProps = Pick<ComponentProps<typeof Link>, 'href' | 'children'> & {
	exact?: boolean;
};

export const HeaderLink = ({ href, children, exact = false }: HeaderLinkProps) => {
	const pathname = usePathname();
	const path = href.toString();
	const isActive = pathname === path || (!exact && pathname.startsWith(`${path}/`));

	return (
		<Link
			href={href}
			aria-current={isActive ? 'page' : undefined}
			className={`rounded-md px-2.5 py-1.5 transition-colors ${
				isActive
					? 'bg-blue-50 font-semibold text-blue-700'
					: 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
			}`}
		>
			{children}
		</Link>
	);
};
