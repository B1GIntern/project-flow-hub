import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getUsers, createUser, registerUser, updateUser, deleteUser, getUserDependencies } from '../controllers/users.controller.js';
import { forceDeleteUser } from '../controllers/admin.controller.js';

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
router.delete('/:id/force', forceDeleteUser);

export { router as usersRoutes };