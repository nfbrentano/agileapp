import api from './api';

export interface DashboardStats {
    stats: {
        totalCards: number;
        totalTeams: number;
        totalMembers: number;
        userCardsCount: number;
    };
    teams: Array<{
        id: string;
        name: string;
        color: string;
        methodology: string;
        memberCount: number;
        cardCount: number;
        activeCards: number;
        completedCards: number;
    }>;
    recentActivities: Array<{
        id: string;
        type: string;
        description: string;
        metadata?: any;
        createdAt: string;
        user: {
            name: string;
            avatar?: string;
        };
        team?: {
            name: string;
        };
    }>;
    myCards: Array<{
        id: string;
        title: string;
        priority: string;
        dueDate?: string;
        teamName: string;
        columnName: string;
        createdAt: string;
    }>;
}

export interface QuickActions {
    teams: Array<{
        id: string;
        name: string;
        color: string;
    }>;
    recentSprints: Array<{
        id: string;
        name: string;
        status: string;
        teamName: string;
        cardCount: number;
        startDate: string;
        endDate: string;
    }>;
}

export const dashboardService = {
    async getDashboardStats(): Promise<DashboardStats> {
        const response = await api.get('/dashboard/stats');
        return response.data;
    },

    async getQuickActions(): Promise<QuickActions> {
        const response = await api.get('/dashboard/quick-actions');
        return response.data;
    }
};
