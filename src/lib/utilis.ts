import { SessionPayload } from '@/lib/session';
import { CloudflareImageResponse, User } from '@/types';
import FormData from 'form-data';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

export function validateIp(ip: string): boolean {
	const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
	const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
	return ip !== 'Unknown' && (ipv4Regex.test(ip) || ipv6Regex.test(ip));
}

export function createSSHKey(comment: string): string {
	const keyData = Buffer.from(`global-api-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`).toString('base64');

	return `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC${keyData}== ${comment}`;
}

export function createScret(length: number = 32): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	const array = new Uint8Array(length);
	crypto.getRandomValues(array);
	for (let i = 0; i < length; i++) {
		result += chars[array[i] % chars.length];
	}
	return result;
}

export function parseCookies(request: Request) {
	const cookieHeader = request.headers.get('Cookie') ?? '';
	const cookies: Record<string, string> = {};

	cookieHeader.split(';').forEach((cookie) => {
		const [name, ...rest] = cookie.trim().split('=');
		cookies[name] = decodeURIComponent(rest.join('='));
	});

	return cookies;
}

export async function verifyToken(token: string, secret: string): Promise<SessionPayload> {
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

export function generateToken(user: User, secret: string, expiresIn: number) {
	const { password, ...rest } = user;

	const token = jwt.sign({ user: rest }, secret, {
		expiresIn,
	});

	return token;
}

export async function uploadImageToCloudflare(
	accountId: string,
	apiToken: string,
	file: File,
	filename: string
): Promise<CloudflareImageResponse> {
	const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`;

	if (!accountId || !apiToken) {
		throw new Error('Missing Cloudflare Account ID or API Token');
	}
	if (!file || !(file instanceof File)) {
		throw new Error('Invalid or missing file');
	}
	if (!filename) {
		throw new Error('Filename is required');
	}

	const form = new FormData();
	form.append('file', file, filename);

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiToken}`,
			},
			body: form,
		});

		const data = (await response.json()) as CloudflareImageResponse;

		if (!response.ok || !data.success) {
			throw new Error(`Cloudflare API error: ${JSON.stringify(data.errors, null, 2)}`);
		}

		return data;
	} catch (error) {
		console.error('Error uploading to Cloudflare Images:', error);
		throw error;
	}
}
