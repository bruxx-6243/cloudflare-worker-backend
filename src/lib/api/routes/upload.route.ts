import { uplaodFile } from '@/lib/api/controllers/upload-file.controller';
import type { Route } from '@/types';

export const uploadFileRoute: { route: Route } = {
	route: {
		path: '/upload-file',
		method: 'POST',
		handler: uplaodFile,
	},
};
