import api from './api';

export interface Webhook {
    id: string;
    teamId: string;
    url: string;
    secret?: string;
    active: boolean;
    events: string[];
    createdAt: string;
    updatedAt: string;
    _count?: {
        deliveries: number;
    };
    status?: 'active' | 'failing' | 'inactive'; // Local visual helper
}

export interface WebhookDelivery {
    id: string;
    webhookId: string;
    event: string;
    payload: any;
    statusCode: number | null;
    success: boolean;
    duration: number;
    error: string | null;
    attemptCount: number;
    deliveredAt: string;
}

const webhookService = {
    listWebhooks: async (teamId: string): Promise<Webhook[]> => {
        const { data } = await api.get(`/webhooks/teams/${teamId}/webhooks`);
        return data;
    },

    createWebhook: async (teamId: string, webhookData: Partial<Webhook>): Promise<Webhook> => {
        const { data } = await api.post(`/webhooks/teams/${teamId}/webhooks`, webhookData);
        return data;
    },

    updateWebhook: async (id: string, webhookData: Partial<Webhook>): Promise<Webhook> => {
        const { data } = await api.put(`/webhooks/webhooks/${id}`, webhookData);
        return data;
    },

    deleteWebhook: async (id: string): Promise<void> => {
        await api.delete(`/webhooks/webhooks/${id}`);
    },

    testWebhook: async (id: string): Promise<{ message: string }> => {
        const { data } = await api.post(`/webhooks/webhooks/${id}/test`);
        return data;
    },

    listDeliveries: async (id: string, page = 1): Promise<WebhookDelivery[]> => {
        const { data } = await api.get(`/webhooks/webhooks/${id}/deliveries?page=${page}`);
        return data;
    }
};

export default webhookService;
