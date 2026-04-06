import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/tasks.controller.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export { router as tasksRoutes };
