import BaseController from '@/lib/api/controllers/base.controller';
import { sessionsTable, usersTable } from '@/lib/db/schema';
import emailServices from '@/lib/services/email.service';
import { ACCESS_TOKEN_DURATION, comparePassword, generateAccessToken, generateRefreshToken, REFRESH_TOKEN_DURATION } from '@/lib/session';
import { parseCookies } from '@/lib/utilis';
import { loginTemplate } from '@/templates/login-template';
import { registrationTemplate } from '@/templates/register-template';
import { AppContext, SessionContext } from '@/types';
import { loginSchema, registerSchema } from '@/types/schemas';

import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';

export default class AuthController extends BaseController {
	async login(request: Request, ctx: AppContext): Promise<Response> {
		try {
			const contentLength = request.headers.get('content-length');
			if (!contentLength || contentLength === '0') {
				return this.jsonResponse({ message: 'No data provided' }, 400);
			}

			const data = await request.json();
			const validateData = loginSchema.safeParse(data);

			if (!validateData.success) {
				return this.jsonResponse({ error: 'Validation failed' }, 400);
			}

			const { email, password } = validateData.data;

			const [user] = await ctx.db.select().from(usersTable).where(eq(usersTable.email, email));

			if (!user) {
				return this.jsonResponse({ error: 'Invalid credentials' }, 401);
			}

			const isValidPassword = await comparePassword(password, user.password);

			if (!isValidPassword) {
				return this.jsonResponse({ error: 'Invalid credentials' }, 401);
			}

			const accessToken = generateAccessToken(user, ctx.env.JWT_ACCESS_SECRET);
			const refreshToken = generateRefreshToken(user, ctx.env.JWT_REFRESH_SECRET);

			await ctx.db.insert(sessionsTable).values({
				userId: user.id,
				refreshToken: refreshToken,
			});

			const { password: _, ...rest } = user;

			const response = new Response(JSON.stringify({ token: accessToken, user: rest, expires_in: ACCESS_TOKEN_DURATION }), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
				},
			});

			response.headers.set(
				'Set-Cookie',
				`refresh_token=${refreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${REFRESH_TOKEN_DURATION}`
			);

			await emailServices.sendEmail({
				url: ctx.env.EMAIL_REMOTE_API_URL,
				data: {
					headers: {
						user: ctx.env.EMAIL_USER,
						password: ctx.env.EMAIL_PASSWORD,
					},
					body: {
						to: user.email,
						subject: 'New Login Notification',
						template: loginTemplate(user.fullName),
					},
				},
			});

			return response;
		} catch (error) {
			console.error('Login error:', error);
			return this.jsonResponse({ error: 'Internal Server Error' }, 500);
		}
	}

	async register(request: Request, ctx: AppContext): Promise<Response> {
		try {
			const contentLength = request.headers.get('content-length');
			if (!contentLength || contentLength === '0') {
				return this.jsonResponse({ message: 'No data provided' }, 400);
			}

			const data = await request.json();
			const validateData = registerSchema.safeParse(data);

			if (!validateData.success) {
				return this.jsonResponse({ error: 'Validation failed' }, 400);
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
				fullName: validData.fullName,
				avatar: validData.avatar,
			};

			const [user] = await ctx.db.insert(usersTable).values(values).returning();

			const accessToken = generateAccessToken(user, ctx.env.JWT_ACCESS_SECRET);
			const refreshToken = generateRefreshToken(user, ctx.env.JWT_REFRESH_SECRET);

			const { password, ...rest } = user;

			const response = new Response(JSON.stringify({ token: accessToken, user: rest, expires_in: 3600 }), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-store',
				},
			});

			response.headers.set(
				'Set-Cookie',
				`refresh_token=${refreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${REFRESH_TOKEN_DURATION}`
			);

			await emailServices.sendEmail({
				url: ctx.env.EMAIL_REMOTE_API_URL,
				data: {
					headers: {
						user: ctx.env.EMAIL_USER,
						password: ctx.env.EMAIL_PASSWORD,
					},
					body: {
						to: user.email,
						subject: 'New Registration Notification',
						template: registrationTemplate(user.fullName, user.email),
					},
				},
			});

			return response;
		} catch (error) {
			console.error('Registration error:', error);
			return this.jsonResponse({ error: 'Internal Server Error' }, 500);
		}
	}

	async refresh(request: Request, ctx: AppContext): Promise<Response> {
		try {
			const cookies = parseCookies(request);
			const refreshToken = cookies['refresh_token'];

			if (!refreshToken) {
				this.jsonResponse({ error: 'No refresh token provided' }, 401); // Use this.jsonResponse for JSON responses in the controller ap
			}

			const [session] = await ctx.db.select().from(sessionsTable).where(eq(sessionsTable.refreshToken, refreshToken));

			if (!session) {
				return this.jsonResponse({ error: 'Invalid refresh token' }, 401);
			}

			const [user] = await ctx.db.select().from(usersTable).where(eq(usersTable.id, session.userId));

			if (!user) {
				return this.jsonResponse({ error: 'User not found' }, 404);
			}

			const newAccessToken = generateAccessToken(user, ctx.env.JWT_ACCESS_SECRET);
			const newRefreshToken = generateRefreshToken(user, ctx.env.JWT_REFRESH_SECRET);

			await ctx.db.update(sessionsTable).set({ refreshToken: newRefreshToken }).where(eq(sessionsTable.refreshToken, refreshToken));

			const { password: _, ...rest } = user;

			const response = new Response(JSON.stringify({ token: newAccessToken, user: rest, expires_in: 3600 }), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-store',
				},
			});

			response.headers.set(
				'Set-Cookie',
				`refresh_token=${newRefreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 3600}`
			);

			return response;
		} catch (error) {
			console.error('Refresh error:', error);
			return this.jsonResponse({ error: 'Internal Server Error' }, 500);
		}
	}

	async profile(_: Request, ctx: SessionContext): Promise<Response> {
		try {
			const userId = ctx.session.user.id;

			const [user] = await ctx.db.select().from(usersTable).where(eq(usersTable.id, userId));

			if (!user) {
				return this.jsonResponse({ error: 'User not found' }, 404);
			}

			const { password, ...rest } = user;

			return this.jsonResponse({ user: rest });
		} catch (error) {
			console.error('Profile error:', error);
			return this.jsonResponse({ error: 'Internal Server Error' }, 500);
		}
	}

	async logout(request: Request, ctx: AppContext): Promise<Response> {
		try {
			const cookies = parseCookies(request);
			const refreshToken = cookies['refresh_token'];

			if (!refreshToken) {
				return this.jsonResponse({ error: 'No refresh token provided' }, 401);
			}

			await ctx.db.delete(sessionsTable).where(eq(sessionsTable.refreshToken, refreshToken));

			const response = new Response(JSON.stringify({ message: 'Logged out' }), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-store',
				},
			});
			response.headers.set('Set-Cookie', `refresh_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);

			return response;
		} catch (error) {
			console.error('Logout error:', error);
			return this.jsonResponse({ error: 'Internal Server Error' }, 500);
		}
	}
}

export const { login, logout, register, profile, refresh } = new AuthController();
