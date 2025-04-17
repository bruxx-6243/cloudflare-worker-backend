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
	password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export type User = typeof schema.usersTable.$inferSelect;
export type LoginType = z.infer<typeof loginSchema>;
