import ApiError from '@/lib/api/handlers/api-error';

export default class BaseController {
	protected handleError(error: unknown): Response {
		let status = 500;
		let message = 'Internal Server Error';

		if (error instanceof ApiError) {
			status = error.statusCode;
			message = error.message;
		} else if (error instanceof Error) {
			console.error('Unexpected error:', error.message, error.stack);
		} else {
			console.error('Unknown error:', error);
		}

		if (error instanceof ApiError || error instanceof Error) {
			console.error(`Error [${status}]: ${message}`);
		}

		return new Response(JSON.stringify({ error: message }), {
			status,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	protected jsonResponse(data: any, status: number = 200): Response {
		return new Response(JSON.stringify(data), {
			status,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	constructor() {
		Object.getOwnPropertyNames(Object.getPrototypeOf(this))
			// @ts-expect-error HACK: you can just ignore this warn
			.filter((methodName): methodName is keyof this => {
				return methodName !== 'constructor' && typeof this[methodName as keyof this] === 'function';
			})
			.forEach((methodName) => {
				this[methodName as keyof this] =
					// @ts-expect-error HACK: you can just ignore this warn
					this[methodName as keyof this].bind(this);
			});
	}
}
