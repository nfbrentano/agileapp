import { Router } from 'express';
import { getMyActivities, getTeamActivities } from '../controllers/activity.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/my', authenticateJWT, getMyActivities);
router.get('/team/:teamId', authenticateJWT, getTeamActivities);

export default router;
