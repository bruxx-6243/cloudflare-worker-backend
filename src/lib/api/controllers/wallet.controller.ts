import BaseController from '@/lib/api/controllers/base.controller';
import { walletTable } from '@/lib/db/schema';
import { createHash, generateReference } from '@/lib/utilis';
import { SessionContext } from '@/types';
import { createWalletSchema } from '@/types/schemas';
import { eq } from 'drizzle-orm';

class WalletController extends BaseController {
	async createWallet(request: Request, ctx: SessionContext): Promise<Response> {
		try {
			const contentLength = request.headers.get('content-length');
			if (!contentLength || contentLength === '0') {
				return this.jsonResponse({ message: 'No data provided' }, 400);
			}

			const data = await request.json();
			if (!data || Object.keys(data).length === 0) {
				return this.jsonResponse({ message: 'No data provided' }, 400);
			}

			const validateData = createWalletSchema.safeParse(data);
			if (!validateData.success) {
				return this.jsonResponse(
					{
						error: 'Validation failed',
						details: validateData.error.errors.map((err) => ({
							field: err.path.join('.'),
							message: err.message,
						})),
					},
					400
				);
			}

			const userId = ctx.session.user.id;

			const [existingWallet] = await ctx.db.select().from(walletTable).where(eq(walletTable.userId, userId)).limit(1);

			if (existingWallet && existingWallet.status !== 'DELETED') {
				return this.jsonResponse({ message: 'You already have a wallet' }, 409);
			}

			const { amount, pin } = validateData.data;

			const ref = generateReference(6);
			const hashPin = await createHash(pin);

			const values = {
				userId,
				walletNumber: ref,
				walletPin: hashPin,
				balance: String(amount),
				status: 'ACTIVE' as const,
			};

			if (existingWallet && existingWallet.status === 'DELETED') {
				await ctx.db.delete(walletTable).where(eq(walletTable.id, existingWallet.id));
			}

			const [newWallet] = await ctx.db.insert(walletTable).values(values).returning();

			return this.jsonResponse(
				{
					message: 'Wallet was created',
					data: {
						wallet: {
							id: newWallet.id,
							walletNumber: newWallet.walletNumber,
							balance: newWallet.balance,
							status: newWallet.status,
							createdAt: newWallet.createdAt,
							updatedAt: newWallet.updatedAt,
						},
					},
				},
				201
			);
		} catch (error) {
			return this.handleError(error);
		}
	}

	async freezeWallet(_: Request, ctx: SessionContext): Promise<Response> {
		try {
			const sessionId = ctx.session.user.id;

			const [wallet] = await ctx.db.select().from(walletTable).where(eq(walletTable.userId, sessionId));

			if (!wallet) {
				return this.jsonResponse({ message: 'Wallet not found' }, 404);
			}

			if (wallet.status === 'FREEZE') {
				return this.jsonResponse({ message: 'Wallet is already frozen' }, 400);
			}

			await ctx.db.update(walletTable).set({ status: 'FREEZE' }).where(eq(walletTable.id, wallet.id));

			return this.jsonResponse({ message: 'Wallet was frozen' });
		} catch (error) {
			console.error(error);
			return this.handleError(error);
		}
	}

	async unFreezeWallet(_: Request, ctx: SessionContext): Promise<Response> {
		try {
			const sessionId = ctx.session.user.id;

			const [wallet] = await ctx.db.select().from(walletTable).where(eq(walletTable.userId, sessionId));

			if (!wallet) {
				return this.jsonResponse({ message: 'Wallet not found' }, 404);
			}

			if (wallet.status === 'ACTIVE') {
				return this.jsonResponse({ message: 'Wallet is already active' }, 400);
			}

			await ctx.db.update(walletTable).set({ status: 'ACTIVE' }).where(eq(walletTable.id, wallet.id));

			return this.jsonResponse({ message: 'Wallet was unfrozen' });
		} catch (error) {
			console.error(error);
			return this.handleError(error);
		}
	}

	async getWallet(_: Request, ctx: SessionContext): Promise<Response> {
		try {
			const sessionId = ctx.session.user.id;

			const [wallet] = await ctx.db.select().from(walletTable).where(eq(walletTable.userId, sessionId));

			if (!wallet) {
				return this.jsonResponse({ message: 'Wallet not found' }, 404);
			}

			const { walletPin, userId, ...rest } = wallet;

			return this.jsonResponse({ wallet: rest });
		} catch (error) {
			return this.handleError(error);
		}
	}

	async deleteWallet(_: Request, ctx: SessionContext): Promise<Response> {
		try {
			const sessionId = ctx.session.user.id;

			const [wallet] = await ctx.db.select().from(walletTable).where(eq(walletTable.userId, sessionId));

			if (!wallet) {
				return this.jsonResponse({ message: 'Wallet not found' }, 404);
			}

			if (wallet.status === 'DELETED') {
				return this.jsonResponse({ message: 'Wallet is already deleted' }, 400);
			}

			await ctx.db.update(walletTable).set({ status: 'DELETED' }).where(eq(walletTable.id, wallet.id));

			return this.jsonResponse({ message: 'Wallet was deleted' });
		} catch (error) {
			console.error(error);
			return this.handleError(error);
		}
	}
}

export const { createWallet, freezeWallet, getWallet, unFreezeWallet, deleteWallet } = new WalletController();
