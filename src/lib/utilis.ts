import { User } from '@/types';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const TOKEN_DURATION = 1000 * 60 * 60 * 1;

export function validateIp(ip: string): boolean {
	const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
	const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
	return ip !== 'Unknown' && (ipv4Regex.test(ip) || ipv6Regex.test(ip));
}

export async function verifyPassword(password: string, passwordHash: string) {
	return await compare(password, passwordHash);
}

export function signJWT(user: User, secret: string) {
	const token = jwt.sign({ userId: user.id, email: user.email }, secret, {
		expiresIn: TOKEN_DURATION,
	});

	return token;
}
