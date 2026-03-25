import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getUsers, createUser, registerUser, updateUser, deleteUser, getUserDependencies } from '../controllers/users.controller.js';

const router = Router();

// Public routes
router.post('/register', registerUser);

// Protected routes
router.use(requireAuth);
router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.get('/:id/dependencies', getUserDependencies);
router.delete('/:id', deleteUser);

export { router as usersRoutes };