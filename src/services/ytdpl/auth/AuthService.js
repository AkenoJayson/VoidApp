import axiosYtdlp from '@/services/axios/axoisYtdlpInstance';

const AuthService = {
    async Login(model) {
        return await axiosYtdlp.post('/auth/login', model);
    }
};

export default AuthService;
