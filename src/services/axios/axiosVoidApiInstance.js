import axios from 'axios';

const axiosInterceptorInstance = axios.create({
    baseURL: import.meta.env.VITE_NEW_API_BASE_URL,
    withCredentials: false
});

// Add token from storage if present
axiosInterceptorInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401/403 globally, but allow login pages
axiosInterceptorInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status || 500;
        const currentPath = window.location.pathname;

        // Only redirect if not on public pages
        const publicPaths = ['/login', '/auth/access', '/auth/register', '/auth/forgotpassword'];
        if (status === 401 && !publicPaths.includes(currentPath)) {
            console.warn(`HTTP ${status} detected, redirecting to /login`);
            window.location.href = '/login';
        }
        if (status === 403 && !publicPaths.includes(currentPath)) {
            console.warn(`HTTP ${status} detected, redirecting to /auth/access`);
            window.location.href = '/auth/access';
        }

        return Promise.reject(error);
    }
);

export default axiosInterceptorInstance;

export async function verifyLogin() {
    const pathname = window.location.pathname;
    if (pathname === '/dash') {
        return true;
    } else {
        try {
            await axiosInterceptorInstance.get('/api/security/check-login');
            return true;
        } catch (err) {
            if (err.response?.status === 401) return false;
            throw err;
        }
    }
}
