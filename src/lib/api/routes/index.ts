import { apiKeyAndSecretRouter } from '@/lib/api/routes/api-key.route';
import { loginRouter, profileRouter, registerRouter } from '@/lib/api/routes/auth.route';
import { logRouter } from '@/lib/api/routes/logs.route';
import { Route } from '@/types';

// Just for testing purposes
import { testRouter } from './test';

const indexRoute: { route: Route } = {
	route: {
		path: '/',
		method: 'GET',
		handler: async () => {
			return new Response(JSON.stringify({ message: 'Hello World!' }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		},
	},
};

function withApiPrefix<T extends { route: Route }>(router: T): T {
	return {
		...router,
		route: {
			...router.route,
			path: `/api${router.route.path.startsWith('/') ? '' : '/'}${router.route.path}`,
		},
	};
}

const routes = [testRouter, logRouter, loginRouter, registerRouter, profileRouter, apiKeyAndSecretRouter];

export default [indexRoute, ...routes.map(withApiPrefix)];
