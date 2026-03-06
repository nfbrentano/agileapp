import api from './api';

export interface CardDependency {
    id: string;
    blockerId: string;
    blockedId: string;
    blocker?: any;
    blocked?: any;
}

export const dependencyService = {
    getDependencies: async (cardId: string) => {
        const response = await api.get<{ blockedBy: CardDependency[], blocking: CardDependency[] }>(`/dependencies/${cardId}`);
        return response.data;
    },

    checkBlockers: async (cardId: string) => {
        const response = await api.get<any[]>(`/dependencies/${cardId}/check`);
        return response.data;
    },

    addDependency: async (blockerId: string, blockedId: string) => {
        const response = await api.post<CardDependency>('/dependencies', { blockerId, blockedId });
        return response.data;
    },

    removeDependency: async (id: string) => {
        await api.delete(`/dependencies/${id}`);
    }
};
