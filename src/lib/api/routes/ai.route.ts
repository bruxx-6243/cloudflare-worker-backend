import { aiChat } from '@/lib/api/controllers/ai.controller';
import { authMiddleware } from '@/middlewares';
import type { Route } from '@/types';

export const chatAIRouter: { route: Route } = {
	route: {
		path: '/ai/chat',
		method: 'POST',
		handler: authMiddleware(aiChat),
	},
};
