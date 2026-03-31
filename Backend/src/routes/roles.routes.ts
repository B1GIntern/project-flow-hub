import { Router } from 'express';
import { rolesController } from '../controllers/roles.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const rolesRoutes = Router();

// Make GET /roles public for user registration
rolesRoutes.get('/', rolesController.list);

// Protect other role operations
rolesRoutes.use(requireAuth);

// Add CRUD routes
rolesRoutes.post('/', rolesController.create);
rolesRoutes.put('/:id', rolesController.update);
rolesRoutes.delete('/:id', rolesController.delete);
