import { Router } from 'express';
import { getDashboardStats, getQuickActions } from '../controllers/dashboard.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Get dashboard main data
router.get('/stats', authenticateJWT, getDashboardStats);

// Get quick actions data
router.get('/quick-actions', authenticateJWT, getQuickActions);

export default router;
