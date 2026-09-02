import Link from 'next/link';
import { signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/generated/prisma/enums';
import { getCurrentUser } from '@/lib/auth/current-user';
import { headerText } from '@/lib/content/header-text';
import { HeaderLink } from './header-link';

const {
	brand,
	signOut: signOutLabel,
	fallbackInitial,
	navigation: { children, locations, assignments, profile },
} = headerText;

export async function signOutAction() {
	'use server';
	await signOut({ redirectTo: '/signin' });
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

	if (!user) return null;

	const initials = getInitials(user.name, user.email);
	const isParent = user.roles.includes(UserRole.PARENT);
	const isCaregiver = user.roles.includes(UserRole.CAREGIVER);

	return (
		<header className="border-b border-gray-200 bg-white">
			<div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4 sm:px-6">
				<Link href="/" className="text-sm font-semibold text-gray-950">
					{brand}
				</Link>

				<nav className="flex items-center gap-4 text-sm">
					{isParent && (
						<>
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
			</div>
		</header>
	);
}
