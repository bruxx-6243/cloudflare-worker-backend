export function validateIp(ip: string): boolean {
	const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
	const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
	return ip !== 'Unknown' && (ipv4Regex.test(ip) || ipv6Regex.test(ip));
}
