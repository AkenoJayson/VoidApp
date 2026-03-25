import axiosN from '@/services/axios/axiosVoidApiInstance';

const FileService = {
    async GetProfileImage(userId) {
        return await axiosN.get(`/api/upload/profile-images`, {
            params: { userId },
            responseType: 'json'
        });
    },

    async GetAllProfileImages() {
        return await axiosN.get('/api/upload/profile-images', {
            responseType: 'json'
        });
    },

    async UploadProfileImage(formData) {
        return await axiosN.post('/api/upload/upload-profile-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};

export default FileService;
