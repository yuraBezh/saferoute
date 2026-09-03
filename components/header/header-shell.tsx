import Link from 'next/link';
import type { ReactNode } from 'react';
import { headerText } from '@/lib/content/header-text';

const containerClasses = {
	public: 'h-16 max-w-7xl px-6 lg:px-10',
	app: 'h-14 max-w-5xl gap-6 px-4 sm:px-6',
} as const;

const brandClasses = {
	public: 'text-base font-black tracking-[-0.03em] text-[#10253f]',
	app: 'text-sm font-semibold text-gray-950',
} as const;

type HeaderVariant = keyof typeof containerClasses;

export const HeaderShell = ({
	children,
	variant,
}: {
	children: ReactNode;
	variant: HeaderVariant;
}) => (
	<header className="border-b border-gray-200 bg-white">
		<div className={`mx-auto flex items-center ${containerClasses[variant]}`}>{children}</div>
	</header>
);

export const BrandLink = ({ variant }: { variant: HeaderVariant }) => (
	<Link href="/" className={brandClasses[variant]}>
		{headerText.brand}
	</Link>
);
