import { Router } from 'express';
import { getSprintReport, getTeamReports } from '../controllers/report.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Public route for shared reports
router.get('/:idOrToken', getSprintReport);

// Protected route for team history
router.get('/team/:teamId', authenticateJWT, getTeamReports);

export default router;
