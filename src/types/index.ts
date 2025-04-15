import * as schema from '@/lib/db/schema';
import { tasksTable } from '@/lib/db/schema';
import { NeonQueryFunction } from '@neondatabase/serverless';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';

type method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS';
export type Task = Omit<typeof tasksTable.$inferSelect, 'id'>;

export type DB = NeonHttpDatabase<typeof schema> & {
	$client: NeonQueryFunction<false, false>;
};

export type Route = {
	path: string;
	method: method;
	handler: (req: Request, ctx: { db: DB }) => Promise<Response>;
};
