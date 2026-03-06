import prisma from '../config/prisma';
import { NotificationType } from '@prisma/client';

export const createNotification = async (args: {
    userId: string;
    type: NotificationType;
    message: string;
    link?: string;
}) => {
    try {
        return await prisma.notification.create({
            data: {
                userId: args.userId,
                type: args.type,
                message: args.message,
                link: args.link || null,
            },
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

export const markAsRead = async (id: string, userId: string) => {
    return await prisma.notification.update({
        where: { id, userId },
        data: { read: true },
    });
};

export const markAllAsRead = async (userId: string) => {
    return await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
    });
};

export const getUserNotifications = async (userId: string, limit = 10, offset = 0) => {
    return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
    });
};
