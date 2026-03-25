import axiosN from '@/services/axios/axiosVoidApiInstance';

const ShoppingListItemService = {
    async GetShoppingListItems(params) {
        return await axiosN.get('api/budget/shoppinglistitem/GetShoppingListItems', params);
    },
    async GetShoppingListSummary(params) {
        return await axiosN.get('api/budget/shoppinglistitem/GetShoppingListSummary', params);
    }
};

export default ShoppingListItemService;
