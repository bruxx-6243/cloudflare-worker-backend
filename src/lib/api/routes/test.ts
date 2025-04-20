import { protectedAuthMiddleware } from '@/middlewares';
import { Route, SessionContext } from '@/types';

export const testRouter = {
	route: {
		path: '/api/test',
		method: 'GET',
		handler: protectedAuthMiddleware((request: Request, ctx: SessionContext) => {
			const userId = ctx.session.user.id;

			return new Response(JSON.stringify({ message: 'test route', userId }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}),
	} satisfies Route,
};
