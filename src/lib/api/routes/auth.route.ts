import { login, profile, refresh, register } from '@/lib/api/controllers/auth.controller';
import { authMiddleware } from '@/middlewares';
import { Route } from '@/types';

function withAuthPrefix<T extends Route>(route: Omit<T, 'path'> & { path: string }): T {
	return {
		...route,
		path: `/auth${route.path.startsWith('/') ? '' : '/'}${route.path}`,
	} as T;
}

export const loginRouter = {
	route: withAuthPrefix({
		path: 'login',
		method: 'POST',
		handler: login,
	}),
};

export const logoutRouter = {
	route: withAuthPrefix({
		path: 'login',
		method: 'POST',
		handler: login,
	}),
};

export const registerRouter = {
	route: withAuthPrefix({
		path: 'register',
		method: 'POST',
		handler: register,
	}),
};
export const refreshRouter = {
	route: withAuthPrefix({
		path: 'refresh',
		method: 'POST',
		handler: refresh,
	}),
};

export const profileRouter = {
	route: withAuthPrefix({
		path: 'profile',
		method: 'GET',
		handler: authMiddleware(profile),
	}),
};
