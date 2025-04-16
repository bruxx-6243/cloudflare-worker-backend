import { requestLogsTable } from '@/lib/db/schema';
import { validateIp } from '@/lib/utilis';
import { AppContext, Route } from '@/types';

type GeoData = {
	network: { ip: string; datacenter: string; dns: string };
	device: { type: string; os: string; userAgent: string; browser?: string };
	location: {
		country: string;
		region: string;
		city: string;
		continent: string;
		latitude: string;
		longitude: string;
		metroCode: string;
		postalCode: string;
		timezone: string;
	};
};

type CloudflareData = Partial<GeoData['location']>;

type DeviceInfo = GeoData['device'];

const deviceTypeMap: Record<string, string> = {
	mobile: 'Mobile',
	tablet: 'Tablet',
	'desktop|windows|macintosh|linux': 'Desktop',
	'tv|smarttv|television': 'SmartTV',
};

const osMap: Record<string, string> = {
	windows: 'Windows',
	'macintosh|mac os x': 'macOS',
	linux: 'Linux',
	android: 'Android',
	'ios|iphone|ipad': 'iOS',
	tizen: 'Tizen',
	webos: 'WebOS',
};

const browserMap: Record<string, string> = {
	'chrome|crios': 'Chrome',
	'firefox|fxios': 'Firefox',
	safari: 'Safari',
	'edge|edgios': 'Edge',
	'opera|opr': 'Opera',
};

const extractDeviceInfo = (userAgent: string): DeviceInfo => {
	const testRegex = (map: Record<string, string>) =>
		Object.entries(map).find(([pattern]) => new RegExp(pattern, 'i').test(userAgent))?.[1] ?? 'Unknown';

	const browser = userAgent.includes('safari') && !userAgent.includes('chrome') ? 'Safari' : testRegex(browserMap);

	return {
		type: testRegex(deviceTypeMap),
		os: testRegex(osMap),
		userAgent,
		browser,
	};
};

const extractNetworkInfo = (headers: Headers): GeoData['network'] => {
	const rawIp = headers.get('cf-connecting-ip') ?? headers.get('x-forwarded-for') ?? 'Unknown';
	return {
		ip: validateIp(rawIp) ? rawIp : 'Invalid',
		datacenter: headers.get('cf-ray') ?? 'Unknown',
		dns: headers.get('cf-resolver') ?? 'Unknown',
	};
};

const logRequest = async (ctx: AppContext, network: GeoData['network'], device: DeviceInfo, location: GeoData['location']) => {
	try {
		const [logEntry] = await ctx.db
			.insert(requestLogsTable)
			.values({
				timestamp: new Date(),
				ip: network.ip,
				userAgent: device.userAgent,
				country: location.country,
				browser: device.browser ?? 'Unknown',
				os: device.os,
				deviceType: device.type,
				device: device.type,
			})
			.returning({ id: requestLogsTable.id });
		return logEntry.id;
	} catch (error) {
		console.warn('Failed to log request:', error);
		return 'logging-failed';
	}
};

const createResponse = (data: GeoData, logId: string) =>
	new Response(JSON.stringify({ ...data, logId }, null, 2), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-store',
			'X-Request-ID': crypto.randomUUID(),
			'X-Log-ID': logId,
		},
	});

const LogRoute: Route = {
	path: '/log',
	method: 'GET',
	handler: async (request, ctx) => {
		try {
			const headers = request.headers;
			const cf = (request.cf as CloudflareData) ?? {};

			const networkInfo = extractNetworkInfo(headers);
			const deviceInfo = extractDeviceInfo(headers.get('user-agent') ?? 'Unknown');
			const locationInfo: GeoData['location'] = {
				country: cf.country ?? 'Unknown',
				region: cf.region ?? 'Unknown',
				city: cf.city ?? 'Unknown',
				continent: cf.continent ?? 'Unknown',
				latitude: cf.latitude ?? 'Unknown',
				longitude: cf.longitude ?? 'Unknown',
				metroCode: cf.metroCode ?? 'Unknown',
				postalCode: cf.postalCode ?? 'Unknown',
				timezone: cf.timezone ?? 'Unknown',
			};

			const responseData: GeoData = { network: networkInfo, device: deviceInfo, location: locationInfo };
			const logId = await logRequest(ctx, networkInfo, deviceInfo, locationInfo);

			return createResponse(responseData, logId);
		} catch (error) {
			console.error('Request processing error:', error);
			return new Response(JSON.stringify({ error: 'Internal Server Error', message: 'Failed to process request' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
};

export const logRoute = { route: LogRoute };
