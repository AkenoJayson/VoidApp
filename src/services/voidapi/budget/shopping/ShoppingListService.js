import axiosN from '@/services/axios/axiosVoidApiInstance';

const ShoppingListService = {
    async GetGroupDropdown() {
        return await axiosN.get('api/budget/shoppinglist/GetGroupDropdown');
    },
    async Save(model) {
        return await axiosN.post('api/budget/shoppinglist/Save', model);
    }
};

export default ShoppingListService;
