import BaseController from '@/lib/api/controllers/base.controller';
import { tasksTable } from '@/lib/db/schema';
import { DB, Task } from '@/types';
import { eq } from 'drizzle-orm';

export default class TaskController extends BaseController {
	async createTask(db: DB, task: Task): Promise<Task> {
		try {
			const [createdTask] = await db.insert(tasksTable).values(task).returning();

			if (!createdTask) {
				throw new Error('Failed to create task');
			}

			return createdTask;
		} catch (error) {
			this.handleError(error);
			throw error;
		}
	}

	async getTaskById(db: DB, id: number): Promise<Task | null> {
		try {
			const task = await db.select().from(tasksTable).where(eq(tasksTable.id, id)).limit(1);

			return task[0] || null;
		} catch (error) {
			this.handleError(error);
			throw error;
		}
	}
}

export const { createTask, getTaskById } = new TaskController();
