import { Router } from 'express';
import { getProjects, createProject, updateProject, deleteProject } from '../controllers/projects.controller.js';

const router = Router();

// Public routes - no authentication required
router.get('/', getProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export { router as projectsRoutes };
