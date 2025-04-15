import { boolean, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const tasksTable = pgTable('tasks', {
	is_completed: boolean().notNull(),
	title: varchar({ length: 255 }).notNull(),
	id: uuid('id').primaryKey().defaultRandom(),
});

export const requestLogsTable = pgTable('request_logs', {
	id: uuid('id').primaryKey().defaultRandom(), // UUID primary key
	timestamp: timestamp('timestamp').notNull(), // ISO timestamp
	ip: varchar('ip', { length: 45 }).notNull(), // IPv4/IPv6
	userAgent: varchar('user_agent', { length: 512 }).notNull(), // Full user agent string
	country: varchar('country', { length: 100 }).notNull(), // Country name/code
	browser: varchar('browser', { length: 50 }).notNull(), // Browser name
	os: varchar('os', { length: 50 }).notNull(), // Operating system
	deviceType: varchar('device_type', { length: 50 }).notNull(), // Device type (Mobile, Desktop, etc.)
	device: varchar('device', { length: 50 }).notNull(), // Alias for device type
});
