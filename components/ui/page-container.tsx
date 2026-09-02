import type { ReactNode } from 'react';

const maxWidthClasses = {
	content: 'max-w-4xl',
	form: 'max-w-2xl',
} as const;

type PageContainerProps = {
	children: ReactNode;
	size?: keyof typeof maxWidthClasses;
};

export const PageContainer = ({ children, size = 'content' }: PageContainerProps) => (
	<main className={`mx-auto w-full px-6 py-10 ${maxWidthClasses[size]}`}>{children}</main>
);
