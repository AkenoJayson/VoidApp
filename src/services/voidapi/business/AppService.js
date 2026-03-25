import axiosN from '@/services/axios/axiosVoidApiInstance';

const AppService = {
    async GetAppVersion() {
        return await axiosN.get('/Business/App/GetAppVersion');
    }
};

export default AppService;
