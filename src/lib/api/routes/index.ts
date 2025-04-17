import { loginRouter, profileRouter, registerRouter } from '@/lib/api/routes/auth.route';
import { logRouter } from '@/lib/api/routes/logs.route';
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

export default [{ route: indexRoute }, logRouter, loginRouter, registerRouter, profileRouter] as Array<{ route: Route }>;
