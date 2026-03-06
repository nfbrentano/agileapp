import { Router } from 'express';
import { getNotifications, readNotification, readAllNotifications } from '../controllers/notification.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getNotifications);
router.patch('/:id/read', readNotification);
router.patch('/read-all', readAllNotifications);

export default router;
