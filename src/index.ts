import { headers } from '@/lib/config';
import * as schema from '@/lib/db/schema';

import routes from '@/lib/api/routes';
import { AppContext } from '@/types';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

function createDb(databaseUrl: string) {
	const sql = neon(databaseUrl);
	return drizzle(sql, { schema });
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const appContext: AppContext = {
			db: createDb(env.DATABASE_URL),
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers });
		}

		const url = new URL(request.url);
		const pathname = url.pathname;
		const method = request.method.toUpperCase();

		const route = routes.find((r) => r.route.path === pathname && r.route.method === method);

		if (!route) {
			return new Response(JSON.stringify({ error: 'Not found' }), {
				status: 404,
				headers,
			});
		}

		try {
			return await route.route.handler(request, appContext);
		} catch (error) {
			return new Response(
				JSON.stringify({
					error: `Internal error: ${error instanceof Error ? error.message : 'Unknown error'}`,
				}),
				{ status: 500, headers }
			);
		}
	},
} satisfies ExportedHandler<Env>;
