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

export const rolesTable = pgTable('roles', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 255 }).notNull().unique(),
});

export const permissionsTable = pgTable('permissions', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 255 }).notNull().unique(),
});

export const rolePermissionsTable = pgTable('role_permissions', {
	roleId: uuid('role_id')
		.notNull()
		.references(() => rolesTable.id),
	permissionId: uuid('permission_id')
		.notNull()
		.references(() => permissionsTable.id),
});

export const userRolesTable = pgTable('user_roles', {
	userId: uuid('user_id')
		.notNull()
		.references(() => usersTable.id),
	roleId: uuid('role_id')
		.notNull()
		.references(() => rolesTable.id),
});
