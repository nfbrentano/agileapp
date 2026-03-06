import { Router } from 'express';
import { getTeamMetrics, getColumnAverages } from '../controllers/metrics.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:teamId', authenticateJWT, getTeamMetrics);
router.get('/:teamId/column-averages', authenticateJWT, getColumnAverages);

export default router;
