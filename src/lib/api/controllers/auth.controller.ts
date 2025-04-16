import BaseController from '@/lib/api/controllers/base.controller';
import { usersTable } from '@/lib/db/schema';
import { signJWT, TOKEN_DURATION, verifyPassword } from '@/lib/utilis';
import { AppContext, loginSchema } from '@/types';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';

export default class AuthController extends BaseController {
	async login(request: Request, ctx: AppContext) {
		try {
			const data = await request.json();

			const validateData = loginSchema.safeParse(data);

			if (!validateData.success) {
				return new Response(JSON.stringify({ error: 'Invalid data' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const { email, password } = validateData.data;

			const [user] = await ctx.db.select().from(usersTable).where(eq(usersTable.email, email));

			if (!user) {
				return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const isValidPassword = await verifyPassword(password, user.password);

			if (!isValidPassword) {
				return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const token = signJWT(user, ctx.env.JWT_SECRET);

			return new Response(JSON.stringify({ token, userId: user.id, expiresIn: TOKEN_DURATION }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (error) {
			console.error('Login error:', error);
			return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}

	async register(request: Request, ctx: AppContext) {
		try {
			const data = await request.json();

			const validateData = loginSchema.safeParse(data);

			if (!validateData.success) {
				return new Response(JSON.stringify({ error: 'Invalid data' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const { email, password } = validateData.data;

			const [existingUser] = await ctx.db.select().from(usersTable).where(eq(usersTable.email, email));

			if (existingUser) {
				return new Response(JSON.stringify({ error: 'User already exists' }), {
					status: 409,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const hashedPassword = await hash(password, 10);

			const [user] = await ctx.db.insert(usersTable).values({ email, password: hashedPassword }).returning();

			const token = signJWT(user, ctx.env.JWT_SECRET);

			return new Response(JSON.stringify({ userId: user.id, token, message: 'User registered' }), {
				status: 201,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (error) {
			console.error('Registration error:', error);
			return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}
}

export const { login, register } = new AuthController();
