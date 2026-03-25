import axiosN from '@/services/axios/axiosVoidApiInstance';

const ShoppingItemService = {
    async GetStoreDropdown() {
        return await axiosN.get('api/budget/shoppingitem/GetStoreDropdown');
    },
    async GetCategoryDropdown() {
        return await axiosN.get('api/budget/shoppingitem/GetCategoryDropdown');
    },
    async GetShoppingItems() {
        return await axiosN.get('api/budget/shoppingitem/GetShoppingItems');
    },
    async GetShoppingItems() {
        return await axiosN.get('api/budget/shoppingitem/GetShoppingItems');
    },
    async GetUnitDropdown() {
        return await axiosN.get('api/budget/shoppingitem/GetUnitDropdown');
    },
    async AddToShoppingList(model) {
        return await axiosN.post('api/budget/shoppingitem/AddToShoppingList', model);
    },
    async CreateNewStore(model) {
        return await axiosN.post('api/budget/shoppingitem/CreateNewStore', model);
    },
    async CreateNewItem(model) {
        return await axiosN.post('api/budget/shoppingitem/CreateNewItem', model);
    },
    async RemoveItem(params) {
        return await axiosN.delete('api/budget/shoppinglistitem/DeleteShoppingListItem', params);
    }
};

export default ShoppingItemService;
