import { apiKeyAndSecretRouter } from '@/lib/api/routes/api-key.route';
import { loginRouter, logoutRouter, profileRouter, refreshRouter, registerRouter } from '@/lib/api/routes/auth.route';
import { logRouter } from '@/lib/api/routes/logs.route';
import { Route } from '@/types';

const indexRoute: { route: Route } = {
	route: {
		path: '/',
		method: 'GET',
		handler: async () => {
			return new Response(
				JSON.stringify({
					message: 'Welcome to the API',
					description: 'This is the base API endpoint',
					availableRoutes: {
						'/api/auth': {
							'/login': 'POST - Authenticate user',
							'/register': 'POST - Create new user account',
							'/profile': 'GET - Get user profile information',
						},
						'/api/log': 'GET - Retrieve system logs',
						'/api/generate-api-key-and-secret': 'Manage API keys and secrets',
					},
					documentation: 'For detailed API documentation and usage examples, please refer to our documentation',
					version: '1.0.0',
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}
			);
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

const routes = [logRouter, loginRouter, logoutRouter, refreshRouter, registerRouter, profileRouter, apiKeyAndSecretRouter];

export default [indexRoute, ...routes.map(withApiPrefix)];
