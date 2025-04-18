import * as schema from '@/lib/db/schema';
import { NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { z } from 'zod';

type method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS';

export type DB = NeonHttpDatabase<typeof schema> & {
	$client: NeonQueryFunction<false, false>;
};

export type AppContext = {
	db: ReturnType<typeof drizzle>;
	env: Env;
};

export type SessionContext = {
	session: {
		userId: string;
		email: string;
		[key: string]: string;
	};
} & AppContext;

export type Handler<T extends AppContext = AppContext> = (req: Request, ctx: T) => Response | Promise<Response>;

export type Route = {
	path: string;
	method: method;
	handler: Handler;
};
export const loginSchema = z.object({
	email: z.string().email(),
	password: z
		.string()
		.min(6, { message: 'Password must be at least 6 characters long' })
		.regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
			message: 'Password must contain at least one capital letter, one number, and one special character',
		}),
});

export type LoginType = z.infer<typeof loginSchema>;
export const STATUS_ENUM = z.enum(['ACTIVE', 'INACTIVE', 'DELETED'], {
	errorMap: () => ({ message: 'Status must be ACTIVE, INACTIVE, or DELETED' }),
});

export type StatusType = (typeof STATUS_ENUM._def.values)[number];

export const registerSchema = z.object({
	userName: z.string().min(1, { message: 'Username is required' }).max(255, { message: 'Username must not exceed 255 characters' }),
	firstName: z.string().min(1, { message: 'First name is required' }).max(255, { message: 'First name must not exceed 255 characters' }),
	lastName: z.string().min(1, { message: 'Last name is required' }).max(255, { message: 'Last name must not exceed 255 characters' }),
	password: z
		.string()
		.min(6, { message: 'Password must be at least 6 characters long' })
		.max(255, { message: 'Password must not exceed 255 characters' })
		.regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
			message: 'Password must contain at least one capital letter, one number, and one special character',
		}),
	email: z.string().email({ message: 'Invalid email address' }).max(255, { message: 'Email must not exceed 255 characters' }),
});

export type RegisterType = Omit<typeof schema.usersTable.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;
export type User = typeof schema.usersTable.$inferSelect;
