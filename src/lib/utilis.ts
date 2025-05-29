import { CloudflareImageResponse } from '@/types';
import { compare, hash } from 'bcryptjs';
import FormData from 'form-data';

import fetch from 'node-fetch';

export function validateIp(ip: string): boolean {
	const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
	const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
	return ip !== 'Unknown' && (ipv4Regex.test(ip) || ipv6Regex.test(ip));
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

export async function comparePassword(password: string, passwordHash: string): Promise<boolean> {
	return await compare(password, passwordHash);
}

export async function createHash(password: string) {
	return await hash(password, 10);
}

export function generateReference(n: number): string {
	const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let result = '';
	const array = new Uint8Array(n);
	crypto.getRandomValues(array);

	for (let i = 0; i < n; i++) {
		result += chars[array[i] % chars.length];
	}

	return result;
}
