import { emailLayout } from '@/templates/email-template';

export const loginTemplate = (name: string) => {
	const content = `
    <h1 style="font-size: 20px; font-weight: bold; color: #333; margin: 0 0 12px 0;">Hello ${name},</h1>
    <p style="font-size: 15px; color: #444; margin: 0 0 12px 0;">
      Your account was just accessed successfully. If this was you, there's nothing else to do.
    </p>
    <p style="font-size: 15px; color: #444; margin: 0 0 12px 0;">
      Here are the details of the login:
    </p>
    <p style="font-size: 13px; color: #444; margin: 0 0 12px 0;">
      Login time: <code style="background-color: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${new Date().toLocaleString()}</code>
    </p>
    <p style="font-size: 13px; color: #333; margin: 0 0 12px 0;">
      If you did not perform this action, please secure your account immediately.
    </p>
    <p style="font-size: 13px; color: #333; margin: 0;">
      Fariol Blondeau,<br><strong style="color: #555;">Bruxx Dev</strong>
    </p>
  `;
	return emailLayout(content);
};
