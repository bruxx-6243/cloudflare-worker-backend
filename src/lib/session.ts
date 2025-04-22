import type { User } from '@/types';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const ACCESS_TOKEN_DURATION = 1000 * 60 * 15;
export const REFRESH_TOKEN_DURATION = 1000 * 60 * 60 * 24 * 7;

export type SessionPayload = {
	user: Omit<User, 'password'>;
	iat?: number;
	exp?: number;
	[key: string]: any;
};
export async function verifySession(token: string, secret: string): Promise<SessionPayload> {
	try {
		const decoded = jwt.verify(token, secret) as SessionPayload;

		if (!decoded.user.id) {
			throw new Error('Invalid session: Missing userId');
		}

		return decoded;
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			throw new Error('Session expired');
		}
		if (error instanceof jwt.JsonWebTokenError) {
			throw new Error('Invalid session token');
		}
		throw new Error('Session verification failed');
	}
}

export async function comparePassword(password: string, passwordHash: string) {
	return await compare(password, passwordHash);
}

export function generateAccessToken(user: User, secret: string) {
	const { password, ...rest } = user;

	const token = jwt.sign({ user: rest }, secret, {
		expiresIn: ACCESS_TOKEN_DURATION,
	});

	return token;
}

export function generateRefreshToken(user: User, secret: string) {
	const { password, ...rest } = user;

	const token = jwt.sign({ user: rest }, secret, {
		expiresIn: REFRESH_TOKEN_DURATION,
	});

	return token;
}
