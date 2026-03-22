import { Router } from 'express';
import { rolesController } from '../controllers/roles.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const rolesRoutes = Router();
rolesRoutes.use(requireAuth);

rolesRoutes.get('/', rolesController.list);
