import BaseController from '@/lib/api/controllers/base.controller';
import { AppContext } from '@/types';

export default class UploadFileController extends BaseController {
	async uplaodFile(request: Request, ctx: AppContext) {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		console.log(file);

		return new Response(JSON.stringify({ message: 'Upload file successfull', file: file.name }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}

export const { uplaodFile } = new UploadFileController();
