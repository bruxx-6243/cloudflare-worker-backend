type CourierResponse = {
	requestId: string;
};

class EmailServiceError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'EmailServiceError';
	}
}

const emailServices = {};

export default emailServices;
