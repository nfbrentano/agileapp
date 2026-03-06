import { Router } from 'express';
import { createCard, moveCard, getCardDetails, deleteCard } from '../controllers/card.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', createCard);
router.patch('/:cardId/move', moveCard);
router.get('/:cardId', getCardDetails);
router.delete('/:cardId', deleteCard);

export default router;
