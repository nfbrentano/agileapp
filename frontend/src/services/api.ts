import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('agile_auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para tratar erro 401 e tentar refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('agile_auth_refresh');
            if (refreshToken) {
                try {
                    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, { refreshToken });
                    const { accessToken } = res.data;
                    localStorage.setItem('agile_auth_token', accessToken);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Se o refresh falhar, limpa tudo e vai para login
                    localStorage.clear();
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
