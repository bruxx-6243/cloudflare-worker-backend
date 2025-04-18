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

export type User = Omit<typeof schema.usersTable.$inferSelect, 'id'>;
export type LoginType = z.infer<typeof loginSchema>;
