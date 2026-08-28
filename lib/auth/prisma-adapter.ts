import type {
	Adapter,
	AdapterAccount,
	AdapterSession,
	AdapterUser,
} from 'next-auth/adapters';
import { Session, User } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

function toAdapterUser(user: User): AdapterUser {
	return {
		id: user.id,
		email: user.email,
		emailVerified: user.emailVerifiedAt,
		name: user.fullName,
		image: user.avatarUrl,
	};
}

async function getUserByEmail(email: string): Promise<AdapterUser | null> {
	const user = await prisma.user.findUnique({ where: { email } });

	if (user) {
		return toAdapterUser(user);
	}

	return null;
}

async function getUser(id: string): Promise<AdapterUser | null> {
	const user = await prisma.user.findUnique({ where: { id } });

	if (user) {
		return toAdapterUser(user);
	}

	return null;
}

async function linkAccount(account: AdapterAccount) {
	const session_state =
		typeof account.session_state === 'string'
			? account.session_state
			: undefined;

	await prisma.account.create({
		data: {
			userId: account.userId,
			type: account.type,
			provider: account.provider,
			providerAccountId: account.providerAccountId,
			access_token: account.access_token,
			refresh_token: account.refresh_token,
			id_token: account.id_token,
			expires_at: account.expires_at,
			token_type: account.token_type,
			scope: account.scope,
			session_state,
		},
	});
}

async function getUserByAccount({
	provider,
	providerAccountId,
}: Pick<
	AdapterAccount,
	'provider' | 'providerAccountId'
>): Promise<AdapterUser | null> {
	const account = await prisma.account.findUnique({
		where: {
			provider_providerAccountId: { provider, providerAccountId },
		},
		include: { user: true },
	});

	if (account) {
		return toAdapterUser(account.user);
	}

	return null;
}

async function createUser(user: AdapterUser): Promise<AdapterUser> {
	const createdUser = await prisma.user.create({
		data: {
			email: user.email,
			emailVerifiedAt: user.emailVerified,
			fullName: user.name ?? user.email.split('@')[0]!,
			avatarUrl: user.image,
		},
	});

	return toAdapterUser(createdUser);
}

function toAdapterSession(session: Session): AdapterSession {
	return {
		sessionToken: session.sessionToken,
		userId: session.userId,
		expires: session.expires,
	};
}

async function createSession(session: AdapterSession): Promise<AdapterSession> {
	const createdSession = await prisma.session.create({
		data: {
			sessionToken: session.sessionToken,
			userId: session.userId,
			expires: session.expires,
		},
	});
	return toAdapterSession(createdSession);
}

async function getSessionAndUser(
	sessionToken: string,
): Promise<{ session: AdapterSession; user: AdapterUser } | null> {
	const session = await prisma.session.findUnique({
		where: { sessionToken },
		include: { user: true },
	});

	if (!session) {
		return null;
	}

	return {
		session: toAdapterSession(session),
		user: toAdapterUser(session.user),
	};
}

async function updateSession(
	session: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>,
): Promise<AdapterSession | null> {
	const updatedSession = await prisma.session.update({
		where: { sessionToken: session.sessionToken },
		data: {
			expires: session.expires,
			userId: session.userId,
		},
	});

	return toAdapterSession(updatedSession);
}

async function deleteSession(sessionToken: string): Promise<void> {
	await prisma.session.deleteMany({ where: { sessionToken } });
}

async function updateUser(
	user: Partial<AdapterUser> & Pick<AdapterUser, 'id'>,
): Promise<AdapterUser> {
	const updatedUser = await prisma.user.update({
		where: { id: user.id },
		data: {
			email: user.email,
			emailVerifiedAt: user.emailVerified,
			fullName: user.name ?? undefined,
			avatarUrl: user.image,
		},
	});

	return toAdapterUser(updatedUser);
}

async function deleteUser(userId: string): Promise<void> {
	await prisma.user.delete({ where: { id: userId } });
}

async function unlinkAccount({
	provider,
	providerAccountId,
}: Pick<AdapterAccount, 'provider' | 'providerAccountId'>): Promise<void> {
	await prisma.account.deleteMany({
		where: { provider, providerAccountId },
	});
}

async function createVerificationToken(): Promise<never> {
	throw new Error('Email sign-in is not supported');
}

async function useVerificationToken(): Promise<never> {
	throw new Error('Not implemented');
}

export function prismaAdapter(): Adapter {
	return {
		getUserByEmail,
		getUser,
		createUser,
		linkAccount,
		getUserByAccount,
		createSession,
		getSessionAndUser,
		updateSession,
		deleteSession,
		updateUser,
		deleteUser,
		unlinkAccount,
		createVerificationToken,
		useVerificationToken,
	};
}
