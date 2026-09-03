import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { landingText } from '@/lib/content/landing-text';

type LandingPageProps = {
	findCaregiverAction: () => Promise<void>;
	becomeCaregiverAction: () => Promise<void>;
};

export function LandingPage({ findCaregiverAction, becomeCaregiverAction }: LandingPageProps) {
	const { hero, howItWorks, caregivers, footer } = landingText;

	return (
		<main className="flex-1 overflow-hidden bg-[#f7fbff] text-[#10253f]">
			<section className="relative mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:py-24">
				<div className="relative z-10 max-w-3xl">
					<p className="mb-5 text-xs font-bold tracking-[0.2em] text-[#116b68] uppercase">
						{hero.eyebrow}
					</p>
					<h1 className="max-w-3xl text-5xl leading-[0.98] font-black tracking-[-0.055em] text-[#10253f] sm:text-6xl lg:text-7xl">
						{hero.title}
					</h1>
					<p className="mt-7 max-w-xl text-lg leading-8 text-[#486077]">{hero.description}</p>
					<div className="mt-9 flex flex-col gap-3 sm:flex-row">
						<form action={findCaregiverAction}>
							<Button type="submit" variant="landingPrimary" className="w-full sm:w-auto">
								{hero.findCaregiver}
							</Button>
						</form>
						<form action={becomeCaregiverAction}>
							<Button type="submit" variant="landingSecondary" className="w-full sm:w-auto">
								{hero.becomeCaregiver}
							</Button>
						</form>
					</div>
				</div>

				<div aria-hidden="true" className="relative mx-auto h-[370px] w-full max-w-md">
					<div className="absolute top-4 right-6 h-64 w-64 rounded-full bg-[#d9efff]" />
					<svg className="absolute inset-0 h-full w-full" viewBox="0 0 440 370" fill="none">
						<path
							d="M36 304C77 229 113 280 146 201C176 130 229 220 267 128C291 70 336 72 402 35"
							stroke="#155eef"
							strokeWidth="8"
							strokeLinecap="round"
							strokeDasharray="2 18"
						/>
						<circle cx="38" cy="304" r="18" fill="#ffcf5c" stroke="#10253f" strokeWidth="5" />
						<circle cx="146" cy="201" r="18" fill="#79d5c9" stroke="#10253f" strokeWidth="5" />
						<path
							d="M383 37h38v40l-19-10-19 10V37Z"
							fill="#ff8e72"
							stroke="#10253f"
							strokeWidth="5"
						/>
					</svg>
					<div className="absolute right-1 bottom-6 w-48 rounded-2xl border border-[#c5d8e8] bg-white p-4 shadow-[0_18px_50px_rgba(35,73,110,0.15)]">
						<p className="text-[11px] font-bold tracking-widest text-[#627a91] uppercase">
							Today’s route
						</p>
						<p className="mt-2 text-sm font-bold">School → Practice → Home</p>
						<p className="mt-1 text-xs text-[#5d7489]">Every handoff, connected.</p>
					</div>
				</div>
			</section>

			<section className="bg-white px-6 py-20 lg:py-24">
				<div className="mx-auto max-w-6xl">
					<p className="text-xs font-bold tracking-[0.2em] text-[#155eef] uppercase">
						{howItWorks.eyebrow}
					</p>
					<h2 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
						{howItWorks.title}
					</h2>
					<ol className="mt-12 grid gap-8 md:grid-cols-3">
						{howItWorks.steps.map((step, index) => (
							<li key={step.title} className="border-t-2 border-[#d5e4f0] pt-6">
								<span className="font-mono text-sm font-bold text-[#116b68]">
									{String(index + 1).padStart(2, '0')}
								</span>
								<h3 className="mt-5 text-xl font-bold">{step.title}</h3>
								<p className="mt-2 max-w-xs leading-7 text-[#5d7489]">{step.description}</p>
							</li>
						))}
					</ol>
				</div>
			</section>

			<section className="px-6 py-20 lg:py-24">
				<div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-[#10345b] text-white md:grid-cols-[1fr_auto]">
					<div className="p-8 sm:p-12 lg:p-16">
						<p className="text-xs font-bold tracking-[0.2em] text-[#79d5c9] uppercase">
							{caregivers.eyebrow}
						</p>
						<h2 className="mt-4 max-w-2xl text-3xl leading-tight font-black tracking-[-0.035em] sm:text-4xl">
							{caregivers.title}
						</h2>
						<p className="mt-5 max-w-xl leading-7 text-[#c8d9e8]">{caregivers.description}</p>
						<form className="mt-8" action={becomeCaregiverAction}>
							<Button type="submit" variant="landingAccent">
								{caregivers.cta}
							</Button>
						</form>
					</div>
					<div aria-hidden="true" className="hidden w-40 border-l border-white/15 md:block">
						<div className="h-1/3 bg-[#155eef]" />
						<div className="h-1/3 bg-[#79d5c9]" />
						<div className="h-1/3 bg-[#ff8e72]" />
					</div>
				</div>
			</section>

			<footer className="border-t border-[#d5e4f0] px-6 py-8">
				<div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-[#5d7489] sm:flex-row sm:items-center sm:justify-between">
					<p>{footer.tagline}</p>
					<Link className="font-semibold text-[#173a5e] hover:text-[#155eef]" href="/privacy">
						{footer.privacy}
					</Link>
				</div>
			</footer>
		</main>
	);
}
