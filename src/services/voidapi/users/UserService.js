import axiosN from '@/services/axios/axiosVoidApiInstance';

const UserService = {
    async GetUserInfo() {
        return await axiosN.get('/api/users/GetUserInfo');
    }
};

export default UserService;
