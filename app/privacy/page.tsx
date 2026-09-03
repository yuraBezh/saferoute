import { privacyText } from '@/lib/content/privacy-text';

const { title, lines } = privacyText;

export default function PrivacyPage() {
	return (
		<main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:py-20">
			<p className="text-xs font-bold tracking-[0.2em] text-blue-700 uppercase">SafeRoute</p>
			<h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">{title}</h1>
			<div className="mt-10 space-y-4 border-l-2 border-blue-200 pl-6 text-[15px] leading-7 text-slate-600">
				{lines.map((line) => (
					<p key={line}>{line}</p>
				))}
			</div>
		</main>
	);
}
