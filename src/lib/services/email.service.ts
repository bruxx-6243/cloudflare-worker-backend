import { Email } from '@/types/schemas';

type EmailResponse = {
	messageId: string;
};

class EmailServiceError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'EmailServiceError';
	}
}

const emailServices = {
	sendEmail: async ({ url, data }: { url: string; data: Email }) => {
		try {
			const response = await fetch(`${url}/deliver/email`, {
				method: 'POST',
				headers: {
					user: data.headers.user,
					password: data.headers.password,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data.body),
			});

			if (!response.ok) {
				throw new EmailServiceError('Failed to send email');
			}

			const responseData: EmailResponse = await response.json();

			return responseData;
		} catch (error) {
			if (error instanceof Error) {
				throw new EmailServiceError(error.message);
			}

			console.log(error);
		}
	},
};

export default emailServices;
