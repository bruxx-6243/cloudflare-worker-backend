import * as schema from '@/lib/db/schema';
import { NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';

type method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS';

export type DB = NeonHttpDatabase<typeof schema> & {
	$client: NeonQueryFunction<false, false>;
};

export type AppContext = {
	db: ReturnType<typeof drizzle>;
};

export type Route = {
	path: string;
	method: method;
	handler: (req: Request, ctx: AppContext) => Promise<Response>;
};
