import ApiError from '@/lib/api/handlers/api-error';

export default class BaseController {
	protected handleError(error: unknown): Response {
		let status = 500,
			message,
			details: Record<string, unknown> | undefined = undefined;

		if (error instanceof ApiError) {
			status = error.statusCode;
			message = error.message;
			details = error.body;

			if (error.isUnAuthenticated()) {
				message = 'Unauthorized: Please log in to access this resource.';
			} else if (error.isForbidden()) {
				message = 'Forbidden: You do not have permission to access this resource.';
			} else if (error.isBadRequest()) {
				message = 'Bad Request: Invalid input provided.';
			} else if (error.isNotFound()) {
				message = 'Not Found: The requested resource could not be found.';
			} else if (error.isConflict()) {
				message = 'Conflict: The request conflicts with existing data.';
			} else if (error.isUnprocessableEntity()) {
				message = 'Unprocessable Entity: The request could not be processed due to semantic errors.';
			} else if (error.isInternalServerError()) {
				message = 'Internal Server Error: An unexpected error occurred on the server.';
			} else if (error.isServiceUnavailable()) {
				message = 'Service Unavailable: The server is temporarily unavailable.';
			} else if (error.isServerError()) {
				message = 'Server Error: An error occurred on the server.';
			}
		} else if (error instanceof Error) {
			console.error('Unexpected error:', error.message, error.stack);
			message = 'Unexpected Error: Something went wrong.';
		} else {
			console.error('Unknown error:', error);
			message = 'Unknown Error: An unexpected issue occurred.';
		}

		console.error(`Error [${status}]: ${message}`, details || '');

		return new Response(
			JSON.stringify({
				error: message,
				...(details ? { details } : {}),
			}),
			{
				status,
				headers: { 'Content-Type': 'application/json' },
			}
		);
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
