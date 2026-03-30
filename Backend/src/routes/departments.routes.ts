import { Router } from 'express';
import { departmentsController } from '../controllers/departments.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const departmentsRoutes = Router();

// Make GET /departments public for user registration
departmentsRoutes.get('/', departmentsController.list);

// Protect other department operations
departmentsRoutes.use(requireAuth);

departmentsRoutes.post('/', departmentsController.create);
departmentsRoutes.put('/:id', departmentsController.update);
departmentsRoutes.post('/:id/reassign-users', departmentsController.reassignUsers);
departmentsRoutes.delete('/:id', departmentsController.delete);
