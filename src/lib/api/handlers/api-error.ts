export default class ApiError extends Error {
	constructor(
		public message: string,
		public statusCode: number,
		public body: Record<string, unknown> | undefined,
		public response: Response
	) {
		super(message);
		this.name = 'ApiError';
	}

	isUnAuthenticated() {
		return this.statusCode === 401;
	}

	isForbidden() {
		return this.statusCode === 403;
	}

	isBadRequest() {
		return this.statusCode === 400;
	}

	isNotFound() {
		return this.statusCode === 404;
	}

	isConflict() {
		return this.statusCode === 409;
	}

	isUnprocessableEntity() {
		return this.statusCode === 422;
	}

	isServerError() {
		return this.statusCode >= 500 && this.statusCode < 600;
	}

	isInternalServerError() {
		return this.statusCode === 500;
	}

	isServiceUnavailable() {
		return this.statusCode === 503;
	}

	isClientError() {
		return this.statusCode >= 400 && this.statusCode < 500;
	}

	isSuccess() {
		return this.statusCode >= 200 && this.statusCode < 300;
	}
}
