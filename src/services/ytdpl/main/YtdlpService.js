import axiosYtdlp from '@/services/axios/axoisYtdlpInstance';

const YtdlpService = {
    async GetDownloads(params) {
        return await axiosYtdlp.post('/filebrowser/downloaded', params);
    },
    async GetProcessingDownloads(params) {
        return await axiosYtdlp.get('/api/v1/running', params);
    },
    async BaseYtdlpRPC(payload) {
        return await axiosYtdlp.post('/rpc/http', payload);
    },
    async DeleteFromHistory(path) {
        return await axiosYtdlp.post('/filebrowser/delete', { path });
    }
};

export default YtdlpService;
