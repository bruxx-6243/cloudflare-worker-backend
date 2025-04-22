import { verifyToken } from '@/lib/utilis';
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
export async function verifyAccessToken(token: string, secret: string): Promise<SessionPayload> {
	return verifyToken(token, secret);
}

export async function verifyRefreshToken(token: string, secret: string): Promise<SessionPayload> {
	return verifyToken(token, secret);
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
