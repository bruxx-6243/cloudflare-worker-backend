import { boolean, integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const tasksTable = pgTable('tasks', {
	is_completed: boolean().notNull(),
	title: varchar({ length: 255 }).notNull(),
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
});


