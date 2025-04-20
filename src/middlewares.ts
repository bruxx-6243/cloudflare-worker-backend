import { apiKeysTable } from '@/lib/db/schema';
import { verifySession } from '@/lib/session';
import { AppContext, Handler, SessionContext } from '@/types';
import { and, eq } from 'drizzle-orm';

export function authMiddleware(handler: Handler<SessionContext>): Handler<AppContext> {
	return async (req: Request, ctx: AppContext): Promise<Response> => {
		try {
			const cookieHeader = req.headers.get('Cookie');
			const sessionCookie = cookieHeader
				?.split(';')
				.find((c) => c.trim().startsWith('session='))
				?.split('=')[1];

			const token = req.headers.get('Authorization')?.replace('Bearer ', '') ?? sessionCookie;

			if (!token) {
				return new Response(JSON.stringify({ error: 'Unauthorized: No session token provided' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const session = await verifySession(token, ctx.env.JWT_SECRET);

			if (!session) {
				return new Response(JSON.stringify({ error: 'Unauthorized: Invalid session' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const extendedCtx: SessionContext = {
				...ctx,
				session,
			};

			return await handler(req, extendedCtx);
		} catch (error) {
			console.error('Session middleware error:', error);
			return new Response(JSON.stringify({ error: 'Internal server error' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	};
}

export function protectedAuthMiddleware(handler: Handler<SessionContext>): Handler<AppContext> {
	return async (req: Request, ctx: AppContext): Promise<Response> => {
		try {
			const cookieHeader = req.headers.get('Cookie');
			const sessionCookie = cookieHeader
				?.split(';')
				.find((c) => c.trim().startsWith('session='))
				?.split('=')[1];

			const token = req.headers.get('Authorization')?.replace('Bearer ', '') ?? sessionCookie;

			if (!token) {
				return new Response(JSON.stringify({ error: 'Unauthorized: No session token provided' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const session = await verifySession(token, ctx.env.JWT_SECRET);

			if (!session) {
				return new Response(JSON.stringify({ error: 'Unauthorized: Invalid session' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const apiKey = req.headers.get('X-Api-Key');

			if (!apiKey) {
				return new Response(JSON.stringify({ error: 'Unauthorized: missing X-Api-Key' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const apiSecret = req.headers.get('X-Api-Secret');

			if (!apiSecret) {
				return new Response(JSON.stringify({ error: 'Unauthorized: missing X-Api-Secret' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const [apiKeyAndSecret] = await ctx.db
				.select()
				.from(apiKeysTable)
				.where(and(eq(apiKeysTable.userId, session.user.id), eq(apiKeysTable.key, apiKey), eq(apiKeysTable.secret, apiSecret)));

			if (!apiKeyAndSecret) {
				return new Response(JSON.stringify({ error: 'Unauthorized: Invalid API key or secret' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const extendedCtx: SessionContext = {
				...ctx,
				session,
			};

			return await handler(req, extendedCtx);
		} catch (error) {
			console.error('Session middleware error:', error);
			return new Response(JSON.stringify({ error: 'Internal server error' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	};
}
