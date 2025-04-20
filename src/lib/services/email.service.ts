import { EmailPayload } from '@/types';

type CourierResponse = {
	requestId: string;
};

class EmailServiceError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'EmailServiceError';
	}
}

const emailServices = {
	courier: async ({
		to,
		name,
		token,
		email,
		template,
		apiUrl = 'https://api.courier.com/send',
	}: EmailPayload & { token: string; apiUrl?: string }): Promise<string> => {
		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: {
						template,
						to: { email: to },
						data: { name, email, login_time: new Date().toLocaleString(), registration_date: new Date().toLocaleString() },
					},
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new EmailServiceError(`Failed to send email: ${errorText}`);
			}

			const { requestId } = (await response.json()) as CourierResponse;
			return requestId;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			throw new EmailServiceError(`Courier service error: ${errorMessage}`);
		}
	},
};

export default emailServices;
