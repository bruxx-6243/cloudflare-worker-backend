import { login, register } from '@/lib/api/controllers/auth.controller';
import { Route } from '@/types';

const loginRoute: Route = {
	path: '/auth/login',
	method: 'POST',
	handler: login,
};

const registerRoute: Route = {
	path: '/auth/register',
	method: 'POST',
	handler: register,
};

export const loginRouter = {
	route: loginRoute,
};

export const registerRouter = {
	route: registerRoute,
};
