import {
	changeWalletPin,
	createWallet,
	deleteWallet,
	freezeWallet,
	getWallet,
	getWalletBalance,
	unFreezeWallet,
} from '@/lib/api/controllers/wallet.controller';
import { authMiddleware } from '@/middlewares';
import type { Route } from '@/types';

export const createWalletRouter: { route: Route } = {
	route: {
		path: '/wallet',
		method: 'POST',
		handler: authMiddleware(createWallet),
	},
};

export const getWalletRouter: { route: Route } = {
	route: {
		path: '/wallet',
		method: 'GET',
		handler: authMiddleware(getWallet),
	},
};

export const deleteWalletRouter: { route: Route } = {
	route: {
		path: '/wallet',
		method: 'DELETE',
		handler: authMiddleware(deleteWallet),
	},
};

export const freezeWalletRouter: { route: Route } = {
	route: {
		path: '/wallet/freeze',
		method: 'PUT',
		handler: authMiddleware(freezeWallet),
	},
};

export const unFreezeWalletRouter: { route: Route } = {
	route: {
		path: '/wallet/unfreeze',
		method: 'PUT',
		handler: authMiddleware(unFreezeWallet),
	},
};

export const changeWalletPinRouter: { route: Route } = {
	route: {
		path: '/wallet/pin',
		method: 'PUT',
		handler: authMiddleware(changeWalletPin),
	},
};

export const getWalletBalanceRouter: { route: Route } = {
	route: {
		path: '/wallet/balance',
		method: 'GET',
		handler: authMiddleware(getWalletBalance),
	},
};
