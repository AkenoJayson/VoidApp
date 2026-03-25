import axiosN from '@/services/axios/axiosVoidApiInstance';

const ShoppingBudgetService = {
    async Save(model) {
        return await axiosN.post('/api/shoppingbudget/save', model);
    }
};

export default ShoppingBudgetService;
