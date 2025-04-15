import { createTask } from '@/lib/api/controllers/task.controller';
import { headers } from '@/lib/config';
import { Route, Task } from '@/types';

const createTaskRoute: Route = {
	path: '/api/tasks',
	method: 'POST',
	handler: async (request: Request, { db }): Promise<Response> => {
		try {
			const taskPayload = (await request.json()) as Task;
			const createdTask = await createTask(db, taskPayload);

			return new Response(JSON.stringify(createdTask), {
				status: 201,
				headers,
			});
		} catch (error) {
			return new Response(
				JSON.stringify({
					error: `Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`,
				}),
				{
					status: 500,
					headers,
				}
			);
		}
	},
};

export const tasksRouter = {
	route: createTaskRoute,
};
