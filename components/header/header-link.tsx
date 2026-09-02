import Link from 'next/link';
import type { ComponentProps } from 'react';

type HeaderLinkProps = Pick<ComponentProps<typeof Link>, 'href' | 'children'>;

export const HeaderLink = ({ href, children }: HeaderLinkProps) => (
	<Link href={href} className="text-gray-600 hover:text-gray-950">
		{children}
	</Link>
);
