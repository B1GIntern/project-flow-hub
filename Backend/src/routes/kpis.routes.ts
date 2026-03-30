import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getKPIs, createKPI, updateKPI, deleteKPI } from '../controllers/kpis.controller.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

router.get('/', getKPIs);
router.post('/', createKPI);
router.put('/:id', updateKPI);
router.delete('/:id', deleteKPI);

export { router as kpisRoutes };
