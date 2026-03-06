import { Router } from 'express';
import { createTeam, getMyTeams } from '../controllers/team.controller';
import { getTeamWorkload } from '../controllers/workload.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateJWT, createTeam);
router.get('/', authenticateJWT, getMyTeams);
router.get('/:id/workload', authenticateJWT, getTeamWorkload);

export default router;
