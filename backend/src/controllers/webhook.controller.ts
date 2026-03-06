import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { WebhookService } from '../services/webhook.service';
import { authenticateJWT } from '../middlewares/auth.middleware';

export const createWebhook = async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;
        const { url, secret, events } = (req.body as any);

        const webhook = await (prisma as any).webhook.create({
            data: {
                teamId,
                url,
                secret,
                events
            }
        });

        res.status(201).json(webhook);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const listWebhooks = async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;
        const webhooks = await (prisma as any).webhook.findMany({
            where: { teamId },
            include: {
                _count: {
                    select: { deliveries: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(webhooks);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateWebhook = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { url, secret, events, active } = req.body;

        const webhook = await (prisma as any).webhook.update({
            where: { id },
            data: { url, secret, events, active }
        });

        res.json(webhook);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteWebhook = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await (prisma as any).webhook.delete({ where: { id } });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const testWebhook = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await WebhookService.testWebhook(id);
        res.json({ message: 'Test delivery initiated' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const listDeliveries = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = 50;
        const skip = (page - 1) * limit;

        const deliveries = await (prisma as any).webhookDelivery.findMany({
            where: { webhookId: id },
            orderBy: { deliveredAt: 'desc' },
            take: limit,
            skip: skip
        });

        res.json(deliveries);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
