import BaseController from '@/lib/api/controllers/base.controller';
import { usersTable } from '@/lib/db/schema';
import { signJWT, TOKEN_DURATION, verifyPassword } from '@/lib/session';
import { AppContext, SessionContext } from '@/types';
import { loginSchema, registerSchema } from '@/types/schemas';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';

export default class AuthController extends BaseController {
	async login(request: Request, ctx: AppContext): Promise<Response> {
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
	async register(request: Request, ctx: AppContext): Promise<Response> {
		try {
			const data = await request.json();
			const validateData = registerSchema.safeParse(data);

			if (!validateData.success) {
				return new Response(
					JSON.stringify({
						error: 'Validation failed',
						details: validateData.error.errors.map((err) => ({
							path: err.path.join('.'),
							message: err.message,
						})),
					}),
					{
						status: 400,
						headers: { 'Content-Type': 'application/json' },
					}
				);
			}

			const validData = validateData.data;

			const [existingUser] = await ctx.db.select().from(usersTable).where(eq(usersTable.email, validData.email));

			if (existingUser) {
				return new Response(JSON.stringify({ error: 'User already exists' }), {
					status: 409,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const hashedPassword = await hash(validData.password, 10);

			const values = {
				email: validData.email,
				password: hashedPassword,
				lastName: validData.lastName,
				userName: validData.userName,
				firstName: validData.firstName,
			};

			const [user] = await ctx.db.insert(usersTable).values(values).returning();

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

	async profile(request: Request, ctx: SessionContext): Promise<Response> {
		try {
			const userId = ctx.session.user.id;

			const [user] = await ctx.db.select().from(usersTable).where(eq(usersTable.id, userId));

			if (!user) {
				return new Response(JSON.stringify({ error: 'User not found' }), {
					status: 404,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const { password, ...rest } = user;

			return new Response(JSON.stringify({ user: rest }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (error) {
			console.error('Profile error:', error);
			return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	}
}

export const { login, register, profile } = new AuthController();
