import BaseController from '@/lib/api/controllers/base.controller';
import { uploadImageToCloudflare } from '@/lib/utilis';
import type { AppContext } from '@/types';

export default class UploadFileController extends BaseController {
	async uplaodFile(request: Request, ctx: AppContext) {
		try {
			const formData = await request.formData();
			const file = formData.get('file') as File;

			const data = await uploadImageToCloudflare(ctx.env.CLOUDFLARE_ACCOUNT_ID, ctx.env.CLOUDFLARE_API_TOKEN, file, file.name);

			if (!data) {
				throw new Error('Upload file failed');
			}

			return new Response(
				JSON.stringify({
					message: 'image uploaded successfully',
					file_url: data.result?.variants[0],
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		} catch (error) {
			return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Upload file failed' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}
}

export const { uplaodFile } = new UploadFileController();
