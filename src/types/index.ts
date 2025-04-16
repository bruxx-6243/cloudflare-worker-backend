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

export type Route = {
	path: string;
	method: method;
	handler: (req: Request, ctx: AppContext) => Promise<Response>;
};
export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export type User = typeof schema.usersTable.$inferSelect;
export type LoginType = z.infer<typeof loginSchema>;

