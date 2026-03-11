import { Router } from 'express';
import { 
    createTeam, 
    getMyTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    getTeamMembers,
    addTeamMember,
    removeTeamMember,
    getTeamSprints,
    getTeamStats
} from '../controllers/team.controller';
import { getTeamWorkload } from '../controllers/workload.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateJWT, createTeam);
router.get('/', authenticateJWT, getMyTeams);

router.get('/:id', authenticateJWT, getTeamById);
router.patch('/:id', authenticateJWT, updateTeam);
router.delete('/:id', authenticateJWT, deleteTeam);

router.get('/:id/members', authenticateJWT, getTeamMembers);
router.post('/:id/members', authenticateJWT, addTeamMember);
router.delete('/:id/members/:memberId', authenticateJWT, removeTeamMember);

router.get('/:id/sprints', authenticateJWT, getTeamSprints);
router.get('/:id/stats', authenticateJWT, getTeamStats);
router.get('/:id/workload', authenticateJWT, getTeamWorkload);

export default router;
