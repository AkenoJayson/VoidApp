import axiosN from '@/services/axios/axiosVoidApiInstance';

const NotificationService = {
    async Register(token) {
        return await axiosN.post('/api/Notification/Register', { Token: token });
    },
    async GetActivityLog() {
        return await axiosN.get('/api/Notification/GetActivityLog');
    }
};

export default NotificationService;
