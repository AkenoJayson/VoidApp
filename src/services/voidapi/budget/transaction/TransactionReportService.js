import axiosN from '@/services/axios/axiosVoidApiInstance';

const TransactionReportService = {
    async GetMonthlySpend(params) {
        return await axiosN.get('/api/TransactionReport/GetMonthlySpend', params);
    },

    async GetMonthlyIncome(params) {
        return await axiosN.get('/api/TransactionReport/GetMonthlyIncome', params);
    },

    async GetSubCategoryTotals(params) {
        return await axiosN.get('/api/TransactionReport/GetSubCategoryTotals', params);
    },

    async GetCurrentMonthProjection(params) {
        return await axiosN.get('/api/TransactionReport/GetCurrentMonthProjection', params);
    },
    async GetStoreTrend(params) {
        return await axiosN.get('/api/TransactionReport/GetStoreTrend', params);
    }
};

export default TransactionReportService;
