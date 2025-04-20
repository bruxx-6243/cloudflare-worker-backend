import { pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const userStatusEnum = pgEnum('status', ['ACTIVE', 'INACTIVE', 'DELETED']);

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

export const usersTable = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),

	userName: varchar('user_name', { length: 255 }).notNull(),
	firstName: varchar('first_name', { length: 255 }).notNull(),
	lastName: varchar('last_name', { length: 255 }).notNull(),
	password: varchar('password', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	status: userStatusEnum('status').default('ACTIVE').notNull(),

	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
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
