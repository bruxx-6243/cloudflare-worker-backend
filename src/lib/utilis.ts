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
