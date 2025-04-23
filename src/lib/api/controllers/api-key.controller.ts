import BaseController from '@/lib/api/controllers/base.controller';
import { apiKeysTable } from '@/lib/db/schema';
import { createScret, createSSHKey } from '@/lib/utilis';
import { SessionContext } from '@/types';

export default class ApiKeyAndSecretController extends BaseController {
	async generateApiKeyAndSecret(_: Request, ctx: SessionContext): Promise<Response> {
		try {
			const userId = ctx.session.user.id;

			const generatedKey = createSSHKey(ctx.session.user.userName);
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

			return new Response(JSON.stringify({ api_key: key, api_secret: secret }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (error) {
			console.error('APIKeyError:', error);
			return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}
}

export const { generateApiKeyAndSecret } = new ApiKeyAndSecretController();
