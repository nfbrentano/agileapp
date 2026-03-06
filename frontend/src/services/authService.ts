import api from './api';

const AUTH_KEY = 'agile_auth';

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface UserProfile extends User {
    googleId?: string | null;
    appleId?: string | null;
    hasPassword?: boolean;
}

export const authService = {
    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', { email, password });
        if (response.data.accessToken) {
            localStorage.setItem(`${AUTH_KEY}_token`, response.data.accessToken);
            localStorage.setItem(`${AUTH_KEY}_refresh`, response.data.refreshToken);
            localStorage.setItem(`${AUTH_KEY}_user`, JSON.stringify(response.data.user));
        }
        return response.data;
    },

    async register(name: string, email: string, password: string): Promise<void> {
        await api.post('/auth/register', { name, email, password });
    },

    async logout(): Promise<void> {
        const refreshToken = localStorage.getItem(`${AUTH_KEY}_refresh`);
        if (refreshToken) {
            await api.post('/auth/logout', { refreshToken }).catch(() => { });
        }
        localStorage.removeItem(`${AUTH_KEY}_token`);
        localStorage.removeItem(`${AUTH_KEY}_refresh`);
        localStorage.removeItem(`${AUTH_KEY}_user`);
    },

    async forgotPassword(email: string): Promise<void> {
        await api.post('/auth/forgot-password', { email });
    },

    async resetPassword(token: string, password: string): Promise<void> {
        await api.post('/auth/reset-password', { token, newPassword: password });
    },

    async refresh(): Promise<string> {
        const refreshToken = localStorage.getItem(`${AUTH_KEY}_refresh`);
        if (!refreshToken) throw new Error('No refresh token');
        const response = await api.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
        localStorage.setItem(`${AUTH_KEY}_token`, response.data.accessToken);
        return response.data.accessToken;
    },

    getUser(): User | null {
        const user = localStorage.getItem(`${AUTH_KEY}_user`);
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem(`${AUTH_KEY}_token`);
    },

    async getProfile(): Promise<UserProfile> {
        const response = await api.get<UserProfile>('/auth/me');
        return response.data;
    },

    async unlinkGoogle(): Promise<void> {
        await api.delete('/auth/unlink/google');
    },

    async unlinkApple(): Promise<void> {
        await api.delete('/auth/unlink/apple');
    }
};
