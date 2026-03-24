import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getUsers, createUser, registerUser, updateUser, deleteUser } from '../controllers/users.controller.js';

const router = Router();

// Public routes
router.post('/register', registerUser);

// Protected routes
router.use(requireAuth);
router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export { router as usersRoutes };