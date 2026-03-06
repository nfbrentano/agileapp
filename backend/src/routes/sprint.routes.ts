import { Router } from 'express';
import { createSprint, startSprint, addCardToSprint, closeSprint } from '../controllers/sprint.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', createSprint);
router.patch('/:sprintId/start', startSprint);
router.post('/:sprintId/close', closeSprint);
router.post('/:sprintId/cards/:cardId', addCardToSprint);

export default router;
