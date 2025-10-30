import { RouteRecordRaw } from 'vue-router';
import coursesRoutes from './courses.routes';

// Combine all route modules
const routeModules: RouteRecordRaw[] = [
  ...coursesRoutes
];

export default routeModules;