import { generateToken, verifyToken } from '@/lib/utilis';
import type { User } from '@/types';
import { compare } from 'bcryptjs';

export const ACCESS_TOKEN_DURATION = 1000 * 60 * 15;
export const REFRESH_TOKEN_DURATION = 1000 * 60 * 60 * 24 * 7;

export type SessionPayload = {
	user: Omit<User, 'password'>;
	iat?: number;
	exp?: number;
	[key: string]: any;
};

export function generateAccessToken(user: User, secret: string) {
	return generateToken(user, secret, ACCESS_TOKEN_DURATION);
}

export function generateRefreshToken(user: User, secret: string) {
	return generateToken(user, secret, REFRESH_TOKEN_DURATION);
}

export async function verifyAccessToken(token: string, secret: string): Promise<SessionPayload> {
	return verifyToken(token, secret);
}

export async function verifyRefreshToken(token: string, secret: string): Promise<SessionPayload> {
	return verifyToken(token, secret);
}

export async function comparePassword(password: string, passwordHash: string) {
	return await compare(password, passwordHash);
}
