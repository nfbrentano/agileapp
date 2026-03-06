import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';

export const getNotifications = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
        const notifications = await notificationService.getUserNotifications(userId, limit, offset);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar notificações' });
    }
};

export const readNotification = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { id } = req.params;

    try {
        await notificationService.markAsRead(id as string, userId);
        res.json({ message: 'Notificação lida' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar notificação' });
    }
};

export const readAllNotifications = async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    try {
        await notificationService.markAllAsRead(userId);
        res.json({ message: 'Todas as notificações marcadas como lidas' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao marcar notificações como lidas' });
    }
};
