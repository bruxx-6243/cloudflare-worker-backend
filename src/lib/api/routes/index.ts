import { requestLogRoute } from '@/lib/api/routes/logs.route';
import { Route } from '@/types';

export default [requestLogRoute] as Array<{ route: Route }>;
