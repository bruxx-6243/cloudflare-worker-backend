import BaseController from '@/lib/api/controllers/base.controller';
import { SessionContext } from '@/types';
import { chatMessageSchema } from '@/types/schemas';

export class AIController extends BaseController {
	async chatWithAI(request: Request, ctx: SessionContext): Promise<Response> {
		try {
			const contentLength = request.headers.get('content-length');
			if (!contentLength || contentLength === '0') {
				return this.jsonResponse({ message: 'No data provided' }, 400);
			}

			const data = await request.json();
			if (!data || Object.keys(data).length === 0) {
				return this.jsonResponse({ message: 'No data provided' }, 400);
			}

			const validateData = chatMessageSchema.safeParse(data);
			if (!validateData.success) {
				return this.jsonResponse({ error: 'Invalid data' }, 400);
			}

			const { message } = validateData.data;
			const userId = ctx.session?.user?.id;

			return this.jsonResponse({ message, userId }, 200);
		} catch (error) {
			console.error('Error in chatWithAI:', error);
			return this.jsonResponse({ message: 'Internal Server Error' }, 500);
		}
	}
}

export const { chatWithAI } = new AIController();
