import type { ReactNode } from 'react';

export const PageDescription = ({ children }: { children: ReactNode }) => (
	<p className="mt-1 text-sm leading-6 text-gray-600">{children}</p>
);
