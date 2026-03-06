import api from './api';

export interface Notification {
    id: string;
    userId: string;
    type: 'CARD_MOVED' | 'CARD_ASSIGNED' | 'CARD_MENTIONED' | 'SPRINT_STARTED' | 'SPRINT_ENDED';
    message: string;
    read: boolean;
    link?: string;
    createdAt: string;
}

export const notificationService = {
    async getNotifications(limit = 10, offset = 0): Promise<Notification[]> {
        const response = await api.get<Notification[]>('/notifications', {
            params: { limit, offset }
        });
        return response.data;
    },

    async markAsRead(id: string): Promise<void> {
        await api.patch(`/notifications/${id}/read`);
    },

    async markAllAsRead(): Promise<void> {
        await api.patch('/notifications/read-all');
    }
};
