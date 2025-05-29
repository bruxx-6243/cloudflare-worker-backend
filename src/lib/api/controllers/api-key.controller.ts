import BaseController from '@/lib/api/controllers/base.controller';
import { apiKeysTable } from '@/lib/db/schema';
import { createScret, createSSHKey } from '@/lib/session';
import { SessionContext } from '@/types';

class ApiKeyAndSecretController extends BaseController {
	async generateApiKeyAndSecret(_: Request, ctx: SessionContext): Promise<Response> {
		try {
			const userId = ctx.session.user.id;

			const generatedKey = createSSHKey(ctx.session.user.email);
			const generatedSecret = createScret();

			const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

			const [apikey] = await ctx.db
				.insert(apiKeysTable)
				.values({
					key: generatedKey,
					secret: generatedSecret,
					userId,
					expiresAt,
				})
				.returning();

			const { key, secret } = apikey;

			return this.jsonResponse({ api_key: key, api_secret: secret }, 200);
		} catch (error) {
			console.error('APIKeyError:', error);
			return this.jsonResponse({ error: 'Internal Server Error' }, 500);
		}
	}
}

export const { generateApiKeyAndSecret } = new ApiKeyAndSecretController();
