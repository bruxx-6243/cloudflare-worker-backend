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
