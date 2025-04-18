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
	password: PasswordSchema,
	userName: z.string().min(1, { message: 'Username is required' }).max(255, { message: 'Username must not exceed 255 characters' }),
	firstName: z.string().min(1, { message: 'First name is required' }).max(255, { message: 'First name must not exceed 255 characters' }),
	lastName: z.string().min(1, { message: 'Last name is required' }).max(255, { message: 'Last name must not exceed 255 characters' }),
	email: z.string().email({ message: 'Invalid email address' }).max(255, { message: 'Email must not exceed 255 characters' }),
});
