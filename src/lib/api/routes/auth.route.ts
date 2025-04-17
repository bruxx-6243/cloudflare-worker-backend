import { login, profile, register } from '@/lib/api/controllers/auth.controller';
import authMiddleware from '@/middlewares/auth.middleware';
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

const profileRoute: Route = {
	path: '/auth/profile',
	method: 'GET',
	handler: authMiddleware(profile),
};

export const loginRouter = {
	route: loginRoute,
};

export const registerRouter = {
	route: registerRoute,
};

export const profileRouter = {
	route: profileRoute,
};
