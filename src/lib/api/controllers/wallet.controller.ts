import BaseController from '@/lib/api/controllers/base.controller';
import { walletTable } from '@/lib/db/schema';
import { compareHash, createHash, generateReference } from '@/lib/utilis';
import { changePinSchema, createWalletSchema, pinSchema } from '@/types/schemas';
import { eq } from 'drizzle-orm';

import type { SessionContext } from '@/types';

class WalletController extends BaseController {
	protected async verifyPin<T>(data: T, ctx: SessionContext) {
		const validateData = pinSchema.safeParse(data);

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

		const sessionId = ctx.session.user.id;

		const [wallet] = await ctx.db.select().from(walletTable).where(eq(walletTable.userId, sessionId));

		if (!wallet) {
			return this.jsonResponse({ message: 'Wallet not found' }, 404);
		}

		const { pin } = validateData.data;

		const isValidPin = await compareHash(pin, wallet.walletPin);

		if (!isValidPin) {
			return this.jsonResponse({ message: 'Invalid pin' }, 401);
		}

		return wallet;
	}

	async createWallet(request: Request, ctx: SessionContext): Promise<Response> {
		try {
			const data = await this.verifyRequest(request);

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
			const hashPin = await createHash(pin.pin);

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

	async freezeWallet(request: Request, ctx: SessionContext): Promise<Response> {
		try {
			const data = await this.verifyRequest(request);
			const result = await this.verifyPin(data, ctx);

			if (result instanceof Response) {
				return result;
			}

			if (result.status === 'FREEZE') {
				return this.jsonResponse({ message: 'Wallet is already frozen' }, 400);
			}

			await ctx.db.update(walletTable).set({ status: 'FREEZE' }).where(eq(walletTable.id, result.id));

			return this.jsonResponse({ message: 'Wallet was frozen' });
		} catch (error) {
			console.error(error);
			return this.handleError(error);
		}
	}

	async unFreezeWallet(request: Request, ctx: SessionContext): Promise<Response> {
		try {
			const data = await this.verifyRequest(request);
			const result = await this.verifyPin(data, ctx);

			if (result instanceof Response) {
				return result;
			}

			if (result.status === 'ACTIVE') {
				return this.jsonResponse({ message: 'Wallet is already active' }, 400);
			}

			await ctx.db.update(walletTable).set({ status: 'ACTIVE' }).where(eq(walletTable.id, result.id));

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

	async deleteWallet(request: Request, ctx: SessionContext): Promise<Response> {
		try {
			const data = await this.verifyRequest(request);
			const result = await this.verifyPin(data, ctx);

			if (result instanceof Response) {
				return result;
			}

			if (result.status === 'DELETED') {
				return this.jsonResponse({ message: 'Wallet is already deleted' }, 400);
			}

			await ctx.db.update(walletTable).set({ status: 'DELETED' }).where(eq(walletTable.id, result.id));

			return this.jsonResponse({ message: 'Wallet was deleted' });
		} catch (error) {
			console.error(error);
			return this.handleError(error);
		}
	}

	async changeWalletPin(request: Request, ctx: SessionContext): Promise<Response> {
		try {
			const data = await this.verifyRequest(request);

			const validateData = changePinSchema.safeParse(data);

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

			const sessionId = ctx.session.user.id;
			const [wallet] = await ctx.db.select().from(walletTable).where(eq(walletTable.userId, sessionId));

			if (!wallet) {
				return this.jsonResponse({ message: 'Wallet not found' }, 404);
			}

			const { actual_pin, new_pin } = validateData.data;

			const isValidPin = await compareHash(actual_pin, wallet.walletPin);

			if (!isValidPin) {
				return this.jsonResponse({ message: 'Invalid pin' }, 401);
			}

			const newHashPin = await createHash(new_pin);

			await ctx.db.update(walletTable).set({ walletPin: newHashPin }).where(eq(walletTable.userId, sessionId));

			return this.jsonResponse({ message: 'Wallet pin was changed' });
		} catch (error) {
			return this.handleError(error);
		}
	}

	async getWalletBalance(request: Request, ctx: SessionContext): Promise<Response> {
		try {
			const data = await this.verifyRequest(request);
			const result = await this.verifyPin(data, ctx);

			if (result instanceof Response) {
				return result;
			}

			return this.jsonResponse({ balance: result.balance });
		} catch (error) {
			return this.handleError(error);
		}
	}
}

export const { createWallet, freezeWallet, getWallet, unFreezeWallet, deleteWallet, changeWalletPin, getWalletBalance } =
	new WalletController();
