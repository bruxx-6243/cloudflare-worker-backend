import BaseController from '@/lib/api/controllers/base.controller';
import { walletTable } from '@/lib/db/schema';
import { createHash, generateReference } from '@/lib/utilis';
import { SessionContext } from '@/types';
import { createWalletSchema } from '@/types/schemas';
import { eq } from 'drizzle-orm';

class WalletControler extends BaseController {
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

			const [hasWallet] = await ctx.db.select().from(walletTable).where(eq(walletTable.userId, userId));

			if (hasWallet) {
				return this.jsonResponse({ message: 'You already have a wallet' }, 400);
			}

			const { amount, pin } = validateData.data;

			const ref = generateReference(6);
			const hashPin = await createHash(pin);

			const values = {
				userId,
				walletNumber: ref,
				walletPin: hashPin,
				balance: String(amount),
			};

			await ctx.db.insert(walletTable).values(values).returning();

			return this.jsonResponse({ message: 'Wallet was created' });
		} catch (error) {
			console.error('Error in chatWithAI:', error);
			return this.jsonResponse({ message: 'Internal Server Error' }, 500);
		}
	}

	async freezeWallet(request: Request, ctx: SessionContext): Promise<Response> {
		const req = request.json();

		console.log(req);

		return this.jsonResponse({ message: 'Wallet was freeze' });
	}

	async unFreezeWallet(request: Request, ctx: SessionContext): Promise<Response> {
		return this.jsonResponse({ message: 'Wallet was unfreeze' });
	}

	async getWallet(_: Request, ctx: SessionContext): Promise<Response> {
		try {
			const sessionId = ctx.session.user.id;

			const [wallet] = await ctx.db.select().from(walletTable).where(eq(walletTable.userId, sessionId));

			if (!wallet) {
				return this.jsonResponse({ message: 'You do not have a wallet' }, 400);
			}

			const { walletPin, userId, ...rest } = wallet;

			return this.jsonResponse({ wallet: rest });
		} catch (error) {
			console.error('Error in chatWithAI:', error);
			return this.jsonResponse({ message: 'Internal Server Error' }, 500);
		}
	}

	async deleteWallet(request: Request, ctx: SessionContext): Promise<Response> {
		return this.jsonResponse({ message: 'wallet infos' });
	}
}

export const { createWallet, freezeWallet, getWallet, unFreezeWallet, deleteWallet } = new WalletControler();
