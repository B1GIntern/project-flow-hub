import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { rolesRoutes } from './roles.routes.js';
import { usersRoutes } from './users.routes.js';
import { departmentsRoutes } from './departments.routes.js';
import { projectsRoutes } from './projects.routes.js';
import { tasksRoutes } from './tasks.routes.js';
import { kpisRoutes } from './kpis.routes.js';
import { loadEnv } from '../config/env.js';

const env = loadEnv();
const router = Router();

router.use('/auth', authRoutes);
router.use('/roles', rolesRoutes);
router.use('/users', usersRoutes);
router.use('/departments', departmentsRoutes);
router.use('/projects', projectsRoutes);
router.use('/tasks', tasksRoutes);
router.use('/kpis', kpisRoutes);

router.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

export const apiRouter = Router().use(env.API_PREFIX, router);