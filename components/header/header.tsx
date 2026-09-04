import Link from 'next/link';
import { signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/generated/prisma/enums';
import { getCurrentUser } from '@/lib/auth/current-user';
import { headerText } from '@/lib/content/header-text';
import { HeaderLink } from './header-link';
import { BrandLink, HeaderShell } from './header-shell';

const {
	signOut: signOutLabel,
	fallbackInitial,
	signIn,
	navigation: { bookings, children, locations, assignments, profile, becomeCaregiver },
} = headerText;

export async function signOutAction() {
	'use server';
	await signOut({ redirectTo: '/' });
}

const getInitials = (name?: string | null, email?: string | null) =>
	(name ?? email ?? fallbackInitial)
		.split(' ')
		.map((part) => part[0])
		.slice(0, 2)
		.join('')
		.toUpperCase();

export async function Header() {
	const user = await getCurrentUser();

	if (!user) {
		return (
			<HeaderShell variant="public">
				<BrandLink variant="public" />
				<Link
					href="/signin?callbackUrl=/children"
					className="ml-auto rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
				>
					{signIn}
				</Link>
			</HeaderShell>
		);
	}

	const initials = getInitials(user.name, user.email);
	const isParent = user.roles.includes(UserRole.PARENT);
	const isCaregiver = user.roles.includes(UserRole.CAREGIVER);

	return (
		<HeaderShell variant="app">
			<BrandLink variant="app" />

			<nav className="flex items-center gap-4 text-sm">
				{isParent && (
					<>
						<HeaderLink href="/bookings">{bookings}</HeaderLink>
						<HeaderLink href="/children">{children}</HeaderLink>
						<HeaderLink href="/locations">{locations}</HeaderLink>
					</>
				)}
				{isCaregiver && (
					<>
						<HeaderLink href="/caregiver/assignments">{assignments}</HeaderLink>
						<HeaderLink href="/caregiver">{profile}</HeaderLink>
					</>
				)}
				{!isCaregiver && <HeaderLink href="/caregiver/onboarding">{becomeCaregiver}</HeaderLink>}
			</nav>

			<div className="ml-auto flex items-center gap-3">
				<span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-medium text-blue-700">
					{initials}
				</span>
				<span className="hidden text-sm text-gray-700 sm:inline">{user.name}</span>

				<form action={signOutAction}>
					<Button type="submit" variant="secondary">
						{signOutLabel}
					</Button>
				</form>
			</div>
		</HeaderShell>
	);
}
