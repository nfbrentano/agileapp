import { Router } from 'express';
import { getBoard, updateColumn } from '../controllers/board.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/:teamId', getBoard);
router.patch('/columns/:columnId', updateColumn);

export default router;
