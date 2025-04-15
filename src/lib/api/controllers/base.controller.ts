import ApiError from '@/lib/api/handlers/api-error';

export default class BaseController {
	protected handleError(error: unknown) {
		if (error instanceof ApiError) {
			console.error(error.message);
		}

		throw error;
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
