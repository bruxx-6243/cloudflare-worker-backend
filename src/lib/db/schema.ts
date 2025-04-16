import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const requestLogsTable = pgTable('request_logs', {
	id: uuid('id').primaryKey().defaultRandom(),
	timestamp: timestamp('timestamp').notNull(),
	ip: varchar('ip', { length: 45 }).notNull(),
	userAgent: varchar('user_agent', { length: 512 }).notNull(),
	country: varchar('country', { length: 100 }).notNull(),
	browser: varchar('browser', { length: 50 }).notNull(),
	os: varchar('os', { length: 50 }).notNull(),
	deviceType: varchar('device_type', { length: 50 }).notNull(),
	device: varchar('device', { length: 50 }).notNull(),
});

export const usersTable = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	password: varchar('password', { length: 255 }).notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});

