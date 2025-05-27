import BaseController from '@/lib/api/controllers/base.controller';
import { SessionContext } from '@/types';

export class AIController extends BaseController {
	async aiChat(request: Request, ctx: SessionContext): Promise<Response> {
		try {
			const data = await request.json();

			return new Response(JSON.stringify({ message: 'Hello world' }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to process AI chat request';

			return new Response(JSON.stringify({ error: errorMessage }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}
}

export const { aiChat } = new AIController();
