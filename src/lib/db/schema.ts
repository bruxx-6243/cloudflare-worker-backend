import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const userStatusEnum = pgEnum('status', ['ACTIVE', 'INACTIVE', 'DELETED']);
export const userRoleEnum = pgEnum('role', ['ADMIN', 'USER']);
export const walletStatusEnum = pgEnum('status', ['ACTIVE', 'FREEZE', 'DELETED']);
export const transactionStatusEnum = pgEnum('status', ['SUCCESS', 'FAILED', 'PENDING']);

export const requestLogsTable = pgTable('request_logs', {
	id: uuid('id').primaryKey().defaultRandom(),
	timestamp: timestamp('timestamp').notNull(),
	ip: varchar('ip', { length: 45 }).notNull(),
	os: varchar('os', { length: 50 }).notNull(),
	device: varchar('device', { length: 50 }).notNull(),
	browser: varchar('browser', { length: 50 }).notNull(),
	country: varchar('country', { length: 100 }).notNull(),
	userAgent: varchar('user_agent', { length: 512 }).notNull(),
	deviceType: varchar('device_type', { length: 50 }).notNull(),
});

export const apiKeysTable = pgTable('api_keys', {
	id: uuid('id').primaryKey().defaultRandom(),

	userId: uuid('user_id')
		.notNull()
		.references(() => usersTable.id, { onDelete: 'cascade' }),
	key: varchar('key', { length: 255 }).notNull().unique(),
	secret: varchar('secret', { length: 255 }).notNull().unique(),

	createdAt: timestamp('created_at').notNull().defaultNow(),
	expiresAt: timestamp('expires_at').notNull(),
});

export const usersTable = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),

	avatar: varchar('avatar', { length: 255 }),
	password: varchar('password', { length: 255 }).notNull(),
	fullName: varchar('full_name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	role: userRoleEnum('role').notNull().default('USER'),

	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const sessionsTable = pgTable('sessions', {
	id: uuid('id').primaryKey().defaultRandom(),

	userId: uuid('user_id')
		.notNull()
		.references(() => usersTable.id, { onDelete: 'cascade' }),
	refreshToken: varchar('refresh_token').notNull().unique(),

	createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const walletTable = pgTable('wallet', {
	id: uuid('id').primaryKey().defaultRandom(),

	userId: uuid('user_id')
		.notNull()
		.references(() => usersTable.id, { onDelete: 'cascade' }),
	balance: varchar('balance', { length: 255 }).notNull(),
	status: walletStatusEnum('status').notNull().default('ACTIVE'),

	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const transactionsTable = pgTable('transactions', {
	id: uuid('id').primaryKey().defaultRandom(),

	sender: uuid('initiated_by')
		.notNull()
		.references(() => usersTable.id, { onDelete: 'cascade' }),

	receiver: uuid('receiver')
		.notNull()
		.references(() => usersTable.id, { onDelete: 'cascade' }),

	amount: varchar('amount', { length: 255 }).notNull(),
	status: transactionStatusEnum('status').notNull().default('PENDING'),

	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
