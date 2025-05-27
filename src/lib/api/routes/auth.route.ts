import { login, logout, profile, refresh, register } from '@/lib/api/controllers/auth.controller';
import { authMiddleware } from '@/middlewares';
import { Route } from '@/types';

function withAuthPrefix<T extends Route>(route: Omit<T, 'path'> & { path: string }): T {
	return {
		...route,
		path: `/auth${route.path.startsWith('/') ? '' : '/'}${route.path}`,
	} as T;
}

export const loginRouter: { route: Route } = {
	route: withAuthPrefix({
		path: 'login',
		method: 'POST',
		handler: login,
	}),
};

export const logoutRouter: { route: Route } = {
	route: withAuthPrefix({
		path: 'logout',
		method: 'POST',
		handler: logout,
	}),
};

export const registerRouter: { route: Route } = {
	route: withAuthPrefix({
		path: 'register',
		method: 'POST',
		handler: register,
	}),
};
export const refreshRouter: { route: Route } = {
	route: withAuthPrefix({
		path: 'refresh',
		method: 'POST',
		handler: refresh,
	}),
};

export const profileRouter: { route: Route } = {
	route: withAuthPrefix({
		path: 'profile',
		method: 'GET',
		handler: authMiddleware(profile),
	}),
};
