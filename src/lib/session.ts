import { User } from '@/types';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const TOKEN_DURATION = 1000 * 60 * 60 * 1;

type SessionPayload = {
	userId: string;
	email: string;
	iat?: number;
	exp?: number;
	[key: string]: any;
};

export async function verifySession(token: string, secret: string): Promise<SessionPayload> {
	try {
		const decoded = jwt.verify(token, secret) as SessionPayload;

		if (!decoded.userId) {
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

export async function verifyPassword(password: string, passwordHash: string) {
	return await compare(password, passwordHash);
}

export function signJWT(user: User, secret: string) {
	const { password, ...userWithoutPassword } = user;

	user = userWithoutPassword as User;
	const token = jwt.sign({ user }, secret, {
		expiresIn: TOKEN_DURATION,
	});

	return token;
}
