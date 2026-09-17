import type { ReactNode } from 'react';

type InfoTooltipProps = { children: ReactNode; label: string };

export const InfoTooltip = ({ children, label }: InfoTooltipProps) => (
	<span className="group relative inline-flex" tabIndex={0} aria-label={label}>
		<span
			aria-hidden="true"
			className="inline-flex size-4 items-center justify-center rounded-full border border-gray-400 text-[11px] font-bold leading-none text-gray-500"
		>
			i
		</span>
		<span
			role="tooltip"
			className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 hidden w-56 rounded-lg bg-gray-900 px-3 py-2 text-xs font-normal leading-5 text-white shadow-lg group-hover:block group-focus-visible:block"
		>
			{children}
		</span>
	</span>
);
