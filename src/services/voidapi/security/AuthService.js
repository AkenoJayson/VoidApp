import axiosN from '@/services/axios/axiosVoidApiInstance';

const AuthService = {
    async Login(params) {
        return await axiosN.post('/api/security/login', params);
    },
    async Logout() {
        sessionStorage.removeItem('auth_token');
        localStorage.removeItem('auth_token');
        window.location.href = '/';
    }
};

export default AuthService;
