import { z } from 'zod';

export const STATUS_ENUM = z.enum(['ACTIVE', 'INACTIVE', 'DELETED'], {
	errorMap: () => ({ message: 'Status must be ACTIVE, INACTIVE, or DELETED' }),
});

export const PasswordSchema = z
	.string()
	.min(6, { message: 'Password must be at least 6 characters long' })
	.regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
		message: 'Password must contain at least one capital letter, one number, and one special character',
	});

export const loginSchema = z.object({
	email: z.string().email(),
	password: PasswordSchema,
});

export const registerSchema = z.object({
	fullName: z.string().min(3, { message: 'Full name must be at least 3 characters long' }),
	email: z.string().email({ message: 'Invalid email' }),
	avatar: z.string().url({ message: 'Invalid avatar url' }).optional(),
	password: PasswordSchema,
});

export const EmailHeaderSchema = z.object({
	user: z.string().email({ message: 'Invalid email' }),
	password: z.string(),
});

export const EmailBodySchema = z.object({
	to: z.string().email({ message: 'Invalid email' }),
	subject: z.string(),
	template: z.string(),
});

export const EmailSchema = z.object({
	headers: EmailHeaderSchema,
	body: EmailBodySchema,
});

export type Email = z.infer<typeof EmailSchema>;

export const chatMessageSchema = z.object({
	message: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const pinSchema = z.object({
	pin: z.string().length(4, { message: 'Pin must be 4 characters long' }),
});

export type Pin = z.infer<typeof pinSchema>;

export const createWalletSchema = z.object({
	amount: z.number().min(10, { message: 'Amount must be at least 10' }),
	pin: pinSchema,
});

export type CreateWallet = z.infer<typeof createWalletSchema>;

export const changePinSchema = z
	.object({
		actual_pin: z.string().length(4, { message: 'Pin must be 4 characters long' }),
		new_pin: z.string().length(4, { message: 'Pin must be 4 characters long' }),
	})
	.refine((data) => data.actual_pin !== data.new_pin, {
		message: 'New pin must be different from the actual pin',
		path: ['newPin'],
	});
