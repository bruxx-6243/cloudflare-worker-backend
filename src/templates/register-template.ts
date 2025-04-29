import { emailLayout } from '@/templates/email-template';

export const registrationTemplate = (name: string, email: string) => {
	const content = `
    <h1 style="font-size: 20px; font-weight: bold; color: #333; margin: 0 0 12px 0;">Welcome ${name},</h1>
    <p style="font-size: 15px; color: #444; margin: 0 0 12px 0;">
      Thank you for registering with Bruxx Dev. Your account has been created successfully.
    </p>
    <p style="font-size: 15px; color: #444; margin: 0 0 12px 0;">
      To log in, use the email below along with the password you chose during registration:
    </p>
    <p style="font-size: 13px; color: #444; margin: 0 0 20px 0;">
      <strong>Email:</strong> <code style="background-color: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${email}</code>
    </p>
  `;
	return emailLayout(content);
};
