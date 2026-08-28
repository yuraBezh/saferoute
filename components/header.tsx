import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { headerText } from '@/lib/content/header-text';

export async function signOutAction() {
	'use server';
	await signOut({ redirectTo: '/signin' });
}

export async function Header() {
	const session = await auth();
	const user = session?.user;

	if (!user) return null;

	const initials = (user.name ?? user.email ?? headerText.fallbackInitial)
		.split(' ')
		.map((part) => part[0])
		.slice(0, 2)
		.join('')
		.toUpperCase();

	return (
		<header className="border-b border-gray-200 bg-white">
			<div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4 sm:px-6">
				<Link href="/children" className="text-sm font-semibold text-gray-950">
					{headerText.brand}
				</Link>

				<nav className="flex items-center gap-4 text-sm">
					<Link href="/children" className="text-gray-600 hover:text-gray-950">
						{headerText.navigation.children}
					</Link>
					<Link href="/locations" className="text-gray-600 hover:text-gray-950">
						{headerText.navigation.locations}
					</Link>
				</nav>

				<div className="ml-auto flex items-center gap-3">
					<span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-medium text-blue-700">
						{initials}
					</span>
					<span className="hidden text-sm text-gray-700 sm:inline">
						{user.name}
					</span>

					<form action={signOutAction}>
						<button
							type="submit"
							className="rounded-lg px-2.5 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-950"
						>
							{headerText.signOut}
						</button>
					</form>
				</div>
			</div>
		</header>
	);
}
