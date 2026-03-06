import { Router } from 'express';
import { handleUpload, handleDelete, handleGetByCard, uploadMiddleware } from '../controllers/attachment.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/card/:cardId', handleGetByCard);
router.post('/upload', uploadMiddleware, handleUpload);
router.delete('/:id', handleDelete);

export default router;
