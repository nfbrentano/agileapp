import { Router } from 'express';
import {
    createWebhook,
    listWebhooks,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    listDeliveries
} from '../controllers/webhook.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

// Routes for team-level management
router.post('/teams/:teamId/webhooks', authenticateJWT, createWebhook);
router.get('/teams/:teamId/webhooks', authenticateJWT, listWebhooks);

// Routes for individual webhook management
router.put('/webhooks/:id', authenticateJWT, updateWebhook);
router.delete('/webhooks/:id', authenticateJWT, deleteWebhook);
router.post('/webhooks/:id/test', authenticateJWT, testWebhook);
router.get('/webhooks/:id/deliveries', authenticateJWT, listDeliveries);

export default router;
