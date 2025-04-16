import { loginRouter, registerRouter } from '@/lib/api/routes/auth.route';
import { logRoute } from '@/lib/api/routes/logs.route';
import { Route } from '@/types';

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

export default [{ route: indexRoute }, logRoute, loginRouter, registerRouter] as Array<{ route: Route }>;
