import { Router } from 'express';
import * as dependencyController from '../controllers/dependency.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/:cardId', dependencyController.handleGetDependencies);
router.get('/:cardId/check', dependencyController.handleCheckBlockers);
router.post('/', dependencyController.handleAddDependency);
router.delete('/:id', dependencyController.handleRemoveDependency);

export default router;
