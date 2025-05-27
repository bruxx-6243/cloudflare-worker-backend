import BaseController from '@/lib/api/controllers/base.controller';
import { SessionContext } from '@/types';

export class AIController extends BaseController {
	async chatWithAI(request: Request, ctx: SessionContext): Promise<Response> {
		try {
			const contentLength = request.headers.get('content-length');
			if (!contentLength || contentLength === '0') {
				return new Response(JSON.stringify({ message: 'No data provided' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const data = await request.json();

			if (!data || Object.keys(data).length === 0) {
				return new Response(JSON.stringify({ message: 'No data provided' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify({ message: 'Hello world', data: data }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (error) {
			console.error('Error in aiChat:', error);
			return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}
}

export const { chatWithAI } = new AIController();
