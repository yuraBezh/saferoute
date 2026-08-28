import type {
	AdapterAccount,
	AdapterSession,
	AdapterUser,
} from 'next-auth/adapters';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({
	user: {
		findUnique: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	account: {
		findUnique: vi.fn(),
		create: vi.fn(),
		deleteMany: vi.fn(),
	},
	session: {
		findUnique: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		deleteMany: vi.fn(),
	},
}));

vi.mock('@/lib/prisma', () => ({ prisma: db }));

import { prismaAdapter } from './prisma-adapter';

const dbUserFixture = {
	id: 'user-1',
	email: 'ada@example.com',
	emailVerifiedAt: new Date('2026-08-01T12:00:00.000Z'),
	passwordHash: null,
	phone: null,
	fullName: 'Ada Lovelace',
	avatarUrl: 'https://example.com/avatar.png',
	createdAt: new Date('2026-08-01T12:00:00.000Z'),
	updatedAt: new Date('2026-08-01T12:00:00.000Z'),
};

const userFixture: AdapterUser = {
	id: dbUserFixture.id,
	email: dbUserFixture.email,
	emailVerified: dbUserFixture.emailVerifiedAt,
	name: dbUserFixture.fullName,
	image: dbUserFixture.avatarUrl,
};

const accountFixture: AdapterAccount = {
	userId: userFixture.id,
	type: 'oauth',
	provider: 'google',
	providerAccountId: 'google-account-1',
	access_token: 'access-token',
	refresh_token: 'refresh-token',
	id_token: 'id-token',
	expires_at: 1_800_000_000,
	token_type: 'bearer',
	scope: 'openid profile email',
	session_state: 'session-state',
};

const sessionFixture: AdapterSession = {
	sessionToken: 'session-token',
	userId: userFixture.id,
	expires: new Date('2026-09-01T12:00:00.000Z'),
};

const dbSessionFixture = {
	id: 'session-1',
	...sessionFixture,
	createdAt: new Date('2026-08-01T12:00:00.000Z'),
};

describe('prismaAdapter', () => {
	const adapter = prismaAdapter();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('supports the Auth.js user lifecycle and profile mapping', async () => {
		db.user.findUnique.mockResolvedValue(dbUserFixture);
		db.user.create.mockResolvedValue(dbUserFixture);
		db.user.update.mockResolvedValue(dbUserFixture);

		await expect(adapter.getUserByEmail!(userFixture.email)).resolves.toEqual(
			userFixture,
		);
		await expect(adapter.getUser!(userFixture.id)).resolves.toEqual(
			userFixture,
		);
		await expect(adapter.createUser!(userFixture)).resolves.toEqual(
			userFixture,
		);
		await expect(adapter.updateUser!(userFixture)).resolves.toEqual(
			userFixture,
		);

		const unnamedUserFixture = { ...userFixture, name: null };
		await adapter.createUser!(unnamedUserFixture);
		expect(db.user.create).toHaveBeenLastCalledWith({
			data: expect.objectContaining({
				fullName: unnamedUserFixture.email.split('@')[0],
			}),
		});

		await adapter.updateUser!(unnamedUserFixture);
		expect(db.user.update).toHaveBeenLastCalledWith({
			where: { id: unnamedUserFixture.id },
			data: expect.objectContaining({ fullName: undefined }),
		});

		await adapter.deleteUser!(userFixture.id);
		expect(db.user.delete).toHaveBeenCalledWith({
			where: { id: userFixture.id },
		});
	});

	it('returns null when users do not exist', async () => {
		db.user.findUnique.mockResolvedValue(null);

		await expect(
			adapter.getUserByEmail!(userFixture.email),
		).resolves.toBeNull();
		await expect(adapter.getUser!(userFixture.id)).resolves.toBeNull();
	});

	it('supports linking, finding, and unlinking an OAuth account', async () => {
		db.account.findUnique
			.mockResolvedValueOnce({ ...accountFixture, user: dbUserFixture })
			.mockResolvedValueOnce(null);
		const accountKey = {
			provider: accountFixture.provider,
			providerAccountId: accountFixture.providerAccountId,
		};

		await adapter.linkAccount!(accountFixture);
		expect(db.account.create).toHaveBeenLastCalledWith({
			data: expect.objectContaining({
				session_state: accountFixture.session_state,
			}),
		});

		const accountWithoutStateFixture = {
			...accountFixture,
			session_state: null,
		} as unknown as AdapterAccount;
		await adapter.linkAccount!(accountWithoutStateFixture);
		expect(db.account.create).toHaveBeenLastCalledWith({
			data: expect.objectContaining({ session_state: undefined }),
		});

		await expect(adapter.getUserByAccount!(accountKey)).resolves.toEqual(
			userFixture,
		);
		await expect(adapter.getUserByAccount!(accountKey)).resolves.toBeNull();

		await adapter.unlinkAccount!(accountKey);
		expect(db.account.deleteMany).toHaveBeenCalledWith({ where: accountKey });
	});

	it('supports the database-session lifecycle', async () => {
		db.session.create.mockResolvedValue(dbSessionFixture);
		db.session.update.mockResolvedValue(dbSessionFixture);
		db.session.findUnique
			.mockResolvedValueOnce({ ...dbSessionFixture, user: dbUserFixture })
			.mockResolvedValueOnce(null);

		await expect(adapter.createSession!(sessionFixture)).resolves.toEqual(
			sessionFixture,
		);
		await expect(
			adapter.getSessionAndUser!(sessionFixture.sessionToken),
		).resolves.toEqual({ session: sessionFixture, user: userFixture });
		await expect(
			adapter.getSessionAndUser!(sessionFixture.sessionToken),
		).resolves.toBeNull();
		await expect(adapter.updateSession!(sessionFixture)).resolves.toEqual(
			sessionFixture,
		);

		await adapter.deleteSession!(sessionFixture.sessionToken);
		expect(db.session.deleteMany).toHaveBeenCalledWith({
			where: { sessionToken: sessionFixture.sessionToken },
		});
	});

	it('rejects verification-token operations that the app does not support', async () => {
		await expect(
			adapter.createVerificationToken!({
				identifier: userFixture.email,
				token: accountFixture.id_token!,
				expires: sessionFixture.expires,
			}),
		).rejects.toThrow();
		await expect(
			adapter.useVerificationToken!({
				identifier: userFixture.email,
				token: accountFixture.id_token!,
			}),
		).rejects.toThrow();
	});
});
