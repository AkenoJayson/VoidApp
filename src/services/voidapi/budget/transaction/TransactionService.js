import axiosN from '@/services/axios/axiosVoidApiInstance';

const TransactionService = {
    async UploadCsv(model) {
        return await axiosN.post('/api/transaction/UploadCsv', model);
    },
    async MigrateStagingToFinal(params) {
        return await axiosN.post('/api/transaction/MigrateStagingToFinal', params);
    },
    async GetCategoryBoard(params) {
        return await axiosN.get('/api/transaction/GetCategoryBoard', params);
    },
    async UpdateSubCategory(model) {
        return await axiosN.post('/api/transaction/UpdateSubCategory', model);
    },
    async GetCategoryDropdown() {
        return await axiosN.get('/api/transaction/GetCategoryDropdown');
    }
};
export default TransactionService;
