import { createWallet, freezeWallet, getWallet } from '@/lib/api/controllers/wallet.controller';
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

export const freezeWalletRouter: { route: Route } = {
	route: {
		path: '/wallet/:walletId/freeze',
		method: 'POST',
		handler: authMiddleware(freezeWallet),
	},
};
