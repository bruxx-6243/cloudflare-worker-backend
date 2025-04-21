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
	courier: async ({ to, name, token, email, template }: EmailPayload & { token: string }): Promise<string> => {
		try {
			const response = await fetch('https://api.courier.com/send', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: {
						template,
						to: { email: to },
						data: {
							name,
							email,
							login_time: new Date().toLocaleString(),
							registration_date: new Date().toLocaleString(),
						},
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
	mailerSend: async ({
		from,
		to,
		subject,
		text,
		html,
		token,
	}: {
		from: string;
		to: string;
		subject: string;
		text: string;
		html: string;
		token: string;
	}) => {
		try {
			const response = await fetch('https://api.mailersend.com/v1/email', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
					'X-Requested-With': 'XMLHttpRequest',
				},
				body: JSON.stringify({
					from: { email: from },
					to: [{ email: to }],
					subject,
					text,
					html,
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new EmailServiceError(`Failed to send email: ${errorText}`);
			}

			return await response.json();
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			throw new EmailServiceError(`MailerSend service error: ${errorMessage}`);
		}
	},
};

export default emailServices;
