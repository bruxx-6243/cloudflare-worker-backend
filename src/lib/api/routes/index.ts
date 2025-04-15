import { Route } from '@/types';
import { indexRouter } from './index.route';
import { tasksRouter } from './task.route';

const routes: Array<{ route: Route }> = [tasksRouter, indexRouter];

export default routes;
