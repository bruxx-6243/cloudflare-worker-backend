import BaseController from '@/lib/api/controllers/base.controller';
import { uploadImageToCloudflare } from '@/lib/utilis';
import type { AppContext } from '@/types';

class UploadFileController extends BaseController {
	async uplaodFile(request: Request, ctx: AppContext) {
		try {
			const contentLength = request.headers.get('content-length');
			if (!contentLength || contentLength === '0') {
				return new Response(JSON.stringify({ message: 'No data provided' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const formData = await request.formData();
			const file = formData.get('file') as File;

			const data = await uploadImageToCloudflare(ctx.env.CLOUDFLARE_ACCOUNT_ID, ctx.env.CLOUDFLARE_API_TOKEN, file, file.name);

			if (!data) {
				throw new Error('Upload file failed');
			}

			return this.jsonResponse({
				message: 'image uploaded successfully',
				file_url: data.result?.variants[0],
			});
		} catch (error) {
			console.log(error);
			return this.jsonResponse({ error: 'Upload file failed' }, 500);
		}
	}
}

export const { uplaodFile } = new UploadFileController();
