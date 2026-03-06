import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface MetricKPIs {
    avgLead: number;
    avgCycle: number;
    p85Cycle: number;
    count: number;
}

export interface MetricDataPoint {
    cardId: string;
    title: string;
    leadTime: number;
    cycleTime: number;
    completedAt: string;
}

export interface TeamMetrics {
    metricsData: MetricDataPoint[];
    kpis: MetricKPIs;
}

export interface ColumnMetric {
    id: string;
    columnId: string;
    avgTime: number;
    updatedAt: string;
    column: {
        name: string;
    };
}

export const metricsService = {
    getTeamMetrics: async (teamId: string, days: number = 30, filters: { assigneeId?: string, tags?: string[] } = {}): Promise<TeamMetrics> => {
        let url = `/metrics/${teamId}?days=${days}`;
        if (filters.assigneeId) url += `&assigneeId=${filters.assigneeId}`;
        if (filters.tags && filters.tags.length > 0) url += `&tags=${filters.tags.join(',')}`;

        const response = await api.get(url);
        return response.data;
    },

    getColumnAverages: async (teamId: string): Promise<ColumnMetric[]> => {
        const response = await api.get(`/metrics/${teamId}/column-averages`);
        return response.data;
    }
};
