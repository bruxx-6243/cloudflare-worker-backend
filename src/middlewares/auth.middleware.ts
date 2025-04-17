import { verifySession } from '@/lib/session';
import { AppContext, Handler, SessionContext } from '@/types';

export default function authMiddleware(handler: Handler<SessionContext>): Handler<AppContext> {
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
