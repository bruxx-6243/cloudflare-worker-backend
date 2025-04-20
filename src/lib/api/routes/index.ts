import { apiKeyAndSecretRouter } from '@/lib/api/routes/api-key.route';
import { loginRouter, profileRouter, registerRouter } from '@/lib/api/routes/auth.route';
import { logRouter } from '@/lib/api/routes/logs.route';
import { Route } from '@/types';

// Just for testing purposes
import { testRouter } from './test';

const indexRoute: Route = {
	path: '/',
	method: 'GET',
	handler: async () => {
		return new Response(JSON.stringify({ message: 'Hello World!' }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	},
};

export default [{ route: indexRoute }, testRouter, logRouter, loginRouter, registerRouter, profileRouter, apiKeyAndSecretRouter] as Array<{
	route: Route;
}>;
