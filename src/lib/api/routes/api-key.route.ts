import { generateApiKeyAndSecret } from '@/lib/api/controllers/api-key.controller';
import { authMiddleware } from '@/middlewares';
import type { Route } from '@/types';

export const apiKeyAndSecretRouter = {
	route: {
		path: '/auth/generate-api-key-and-secret',
		method: 'GET',
		handler: authMiddleware(generateApiKeyAndSecret),
	} satisfies Route,
};
