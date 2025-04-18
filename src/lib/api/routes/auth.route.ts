import { login, profile, register } from '@/lib/api/controllers/auth.controller';
import { authMiddleware } from '@/middlewares';
import { Route } from '@/types';

export const loginRouter = {
	route: {
		path: '/auth/login',
		method: 'POST',
		handler: login,
	} satisfies Route,
};

export const registerRouter = {
	route: {
		path: '/auth/register',
		method: 'POST',
		handler: register,
	} satisfies Route,
};

export const profileRouter = {
	route: {
		path: '/auth/profile',
		method: 'GET',
		handler: authMiddleware(profile),
	} satisfies Route,
};
