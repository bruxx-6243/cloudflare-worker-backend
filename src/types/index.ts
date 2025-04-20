import * as schema from '@/lib/db/schema';
import { loginSchema, STATUS_ENUM } from '@/types/schemas';
import { NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { z } from 'zod';

type method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS';
export type Handler<T extends AppContext = AppContext> = (req: Request, ctx: T) => Response | Promise<Response>;

export type Route = {
	path: string;
	method: method;
	handler: Handler;
};

export type DB = NeonHttpDatabase<typeof schema> & {
	$client: NeonQueryFunction<false, false>;
};

export type AppContext = {
	db: ReturnType<typeof drizzle>;
	env: Env;
};

export type SessionContext = {
	session: {
		user: Omit<User, 'password'>;
		[key: string]: string | Omit<User, 'password'>;
	};
} & AppContext;

export type LoginType = z.infer<typeof loginSchema>;
export type StatusType = (typeof STATUS_ENUM._def.values)[number];
export type RegisterType = Omit<typeof schema.usersTable.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;
export type User = typeof schema.usersTable.$inferSelect;

export type EmailPayload = {
	to: string;
	body?: string;
	name?: string;
	email?: string;
	subject?: string;
	template: string;
};
