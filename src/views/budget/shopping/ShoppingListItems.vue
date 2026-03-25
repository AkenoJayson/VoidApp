<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useFormatting } from '@/composables/useFormatting';
import DataDialog from '@/components/vue/DataDialog.vue';
import { add } from 'date-fns';
import ShoppingItemService from '@/services/voidapi/budget/shopping/ShoppingItemService';
import ShoppingListItemService from '@/services/voidapi/budget/shopping/ShoppingListItemService';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue';
import VeeSelect from '@/components/validation/VeeSelect.vue';
import { Form } from 'vee-validate';
import * as Yup from 'yup';
import VeeInputNumber from '@/components/validation/VeeInputNumber.vue';
import VeeInputText from '@/components/validation/VeeInputText.vue';
import Popover from 'primevue/popover';
import { marked } from 'marked';

const { formatPrice, isRecent } = useFormatting();
const route = useRoute();
const toast = useToast();
const groupId = ref(null);
const undefinedSelect = { id: 9999, text: 'NOT SET' };
const undefinedObject = {
    gcCategoryId: 9999,
    gcCategoryName: 'NOT SET',
    gcStoreId: 9999,
    gcStoreName: 'NOT SET',
    gcUnitOfMeasureId: 9999,
    itemId: 9999,
    itemName: 'NOT SET',
    unitOfMeasure: 'NOT SET'
};
const modalItemDefault = ref({
    shoppingItemId: null,
    itemName: null,
    gcStoreId: null,
    gcUnitOfMeasure: null,
    unitSize: null,
    quantity: 1,
    gcCategoryId: null,
    currentPrice: null,
    listId: null
});
const modalBusy = ref(false);
const modalTitle = ref('');
const modalItem = ref({});
const addItemModal = ref(false);
const isEditModal = ref(false);
const itemOptions = ref([]);
const storeOptions = ref([]);
const unitOptions = ref([]);
const categoryOptions = ref([]);
const shoppingListItems = ref([]);

// TODO: Implement search functionality
const quickAddSearch = ref('');

const totalItems = computed(() => shoppingListItems.value.length);
const totalCost = computed(() => shoppingListItems.value.reduce((sum, item) => sum + item.currentPrice * item.quantity, 0));
const selectedItems = computed(() => shoppingListItems.value.filter((item) => item.checked).length);
const headerStats = computed(() => [
    { icon: 'pi pi-money-bill', iconColor: 'text-green-400', value: formatPrice(totalCost.value), label: 'Total', iconInd: true },
    { icon: 'pi pi-check-circle', iconColor: 'text-blue-400', value: `${selectedItems.value}/${totalItems.value}`, label: 'Selected', type: 'select' }
]);
const summaryPopover = ref(null);
const shoppingListSummary = ref({});
const exportModalVisible = ref(false);
const exportTarget = ref(null);
const exportItems = ref([]);
const exportPreview = ref('');
const renderedPreview = computed(() => {
    if (!exportPreview.value) return '';
    return marked(exportPreview.value);
});
const categoryIcons = {
    Frozen: '❄️',
    Drinks: '🥤',
    Sweets: '🍬',
    Cereal: '🥣',
    Noodle: '🍜',
    Ingredient: '🧂',
    'House Hold': '🏠',
    Dairy: '🧀',
    Chips: '🍟',
    'Fruit & Vegetables': '🥦',
    'Meat & Poultry': '🍗',
    Seafood: '🐟',
    Bakery: '🍞',
    'Canned Goods': '🥫',
    'Condiments & Sauces': '🍶',
    'Spices & Seasoning': '🌶️',
    'Pantry Staples': '🍱',
    'Cleaning Supplies': '🧽',
    'Toiletries & Personal Care': '🧴',
    'Pet Supplies': '🐾'
};
const includeOptions = ref({
    quantity: true,
    unit: true,
    price: true
});

const modifyItemSchema = Yup.object().shape({
    Item: Yup.string().required(),
    Store: Yup.string().required(),
    'Unit Size': Yup.number().required(),
    'Unit Of Measure': Yup.string().required(),
    Quantity: Yup.number().required(),
    Category: Yup.string().required(),
    Price: Yup.number().required()
});
const exportOptions = ref([
    { id: 1, text: 'Whatsapp' },
    { id: 2, text: 'Obsidian' }
]);

const pageRefresh = () => {
    getShoppingListItems();
};

const getItemOptions = async () => {
    const response = await ShoppingItemService.GetShoppingItems();
    itemOptions.value = [undefinedObject, ...response.data];
};

const getStoreOptions = async () => {
    const response = await ShoppingItemService.GetStoreDropdown();
    storeOptions.value = [undefinedSelect, ...response.data];
};

const getCategoryOptions = async () => {
    const response = await ShoppingItemService.GetCategoryDropdown();
    categoryOptions.value = [undefinedSelect, ...response.data];
};

const getUnitOptions = async () => {
    const response = await ShoppingItemService.GetUnitDropdown();
    unitOptions.value = [undefinedSelect, ...response.data];
};

const getShoppingListItems = async () => {
    const response = await ShoppingListItemService.GetShoppingListItems({ params: { groupId: groupId.value } });
    shoppingListItems.value = response.data;
};

const getShoppingListSummary = async () => {
    const response = await ShoppingListItemService.GetShoppingListSummary({ params: { groupId: groupId.value } });
    shoppingListSummary.value = response.data;
};

const toggleItemSelected = (item) => {
    item.checked = !item.checked;
};

const toggleAllItems = () => {
    const allSelected = shoppingListItems.value.every((item) => item.checked);
    shoppingListItems.value.forEach((item) => (item.checked = !allSelected));
};

const togglePopover = (event) => {
    summaryPopover.value?.toggle(event);
};

const exportAll = () => {
    exportItems.value = shoppingListItems.value;
    openExportModal();
};

const exportSelected = () => {
    exportItems.value = shoppingListItems.value.filter((item) => item.checked);
    openExportModal();
};

const removeSelected = async () => {
    const checkedItems = shoppingListItems.value.filter((item) => item.checked);

    if (checkedItems.length === 0) {
        return;
    }
    try {
        await Promise.all(checkedItems.map((item) => ShoppingItemService.RemoveItem({ params: { itemId: item.itemId } })));
        shoppingListItems.value = shoppingListItems.value.filter((item) => !item.checked);
        pageRefresh();
        toast.add({ severity: 'success', summary: 'Success', detail: 'Selected items removed successfully.', life: 3000 });
    } catch (error) {
        console.error('Error deleting items:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete selected items.', life: 3000 });
    }
};

const openExportModal = () => {
    exportTarget.value = null;
    exportPreview.value = '';
    exportModalVisible.value = true;
};

const openItemModal = (title, item) => {
    modalItem.value = { ...modalItemDefault.value };
    if (item) {
        modalItem.value = { ...item };
        isEditModal.value = true;
    } else {
        isEditModal.value = false;
    }

    modalTitle.value = title;
    addItemModal.value = true;
};

const save = async () => {
    modalBusy.value = true;
    if (modalItem.value.unitSize == null || modalItem.value.unitSize === '') {
        modalItem.value.unitSize = 1;
    }
    try {
        modalItem.value.listId = groupId.value;
        await ShoppingItemService.AddToShoppingList(modalItem.value);
        addItemModal.value = false;
        pageRefresh();
        toast.add({ severity: 'success', summary: 'Success', detail: isEditModal.value ? 'Item updated successfully.' : 'Item added successfully.', life: 3000 });
    } catch (e) {
        console.error('Error saving item:', e);
    } finally {
        modalBusy.value = false;
    }
};

const cancel = () => {
    addItemModal.value = false;
};

const generateExport = () => {
    if (!exportItems.value?.length) {
        exportPreview.value = '';
        renderedPreview.value = '';
        return;
    }

    const grouped = {};
    for (const item of exportItems.value) {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    }

    const sortedCategories = Object.keys(grouped).sort();

    const buildItemText = (item) => {
        let parts = [item.name];

        if (includeOptions.value.unit) parts.push(item.unitSize);
        if (includeOptions.value.unit) parts.push(item.unit?.toUpperCase());
        if (includeOptions.value.quantity) parts.push(`x ${item.quantity}`);
        if (includeOptions.value.price) parts.push(`R${item.currentPrice}`);

        return parts.join(' ');
    };

    if (exportTarget.value === 1) {
        const now = new Date();
        const month = now.toLocaleString('default', { month: 'long' }).toUpperCase();
        const year = now.getFullYear();
        let output = `Shopping List ${month} ${year}\n\n`;

        for (const cat of sortedCategories) {
            const icon = categoryIcons[cat] ?? '🛒';
            output += `${icon} *${cat.toUpperCase()}*\n`;

            grouped[cat].forEach((item) => {
                output += `• ${buildItemText(item)}\n`;
            });

            output += '\n';
        }

        exportPreview.value = output.trim();
        renderedPreview.value = exportPreview.value;
    }

    if (exportTarget.value === 2) {
        let md = '';

        for (const cat of sortedCategories) {
            md += `## ${cat.toUpperCase()}\n\n`;

            grouped[cat].forEach((item) => {
                md += `- [ ] ${buildItemText(item)}\n`;
            });

            md += '\n';
        }

        exportPreview.value = md.trim();
        renderedPreview.value = marked.parse(exportPreview.value);
    }
    toast.add({ severity: 'success', summary: 'Generated', detail: 'Export preview generated successfully.', life: 3000 });
};

const copyToClipboard = async () => {
    if (!exportPreview.value || !exportPreview.value.length) return;

    try {
        await navigator.clipboard.writeText(exportPreview.value);
        toast.add({ severity: 'success', summary: 'Copied', detail: 'Copied to clipboard!.', life: 3000 });
    } catch (err) {
        console.error('Failed to copy:', err);
    }
};

watch(
    () => modalItem.value.shoppingItemId,
    (newId) => {
        if (!newId) return;

        const selected = itemOptions.value.find((i) => i.itemId == newId);
        if (selected) {
            modalItem.value.gcStoreId = selected.gcStoreId;
            modalItem.value.gcCategoryId = selected.gcCategoryId;
            modalItem.value.gcUnitOfMeasure = selected.gcUnitOfMeasureId;
            modalItem.value.unitSize = selected.lastUnitSize;
            if (selected.lastPrice != 0) {
                modalItem.value.currentPrice = selected.lastPrice;
            }
        }
    }
);

watch(exportTarget, (newVal, oldVal) => {
    if (!exportPreview.value) return;
    if (newVal == null) return;

    generateExport();
});

onMounted(async () => {
    groupId.value = parseInt(route.query.groupId);
    await Promise.all([getShoppingListItems(), getItemOptions(), getStoreOptions(), getCategoryOptions(), getUnitOptions(), getShoppingListSummary()]);
});
</script>

<template>
    <div class="min-h-screen bg-gray-900 p-4 text-white md:p-6">
        <div class="w-full">
            <div class="sticky top-0 z-50 mb-6 space-y-4 bg-gray-900/80 p-2 backdrop-blur-lg">
                <div class="flex flex-wrap items-center gap-4">
                    <Button icon="pi pi-arrow-left" text rounded class="!text-white hover:!bg-white/10" />
                    <h1 class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-3xl font-bold text-transparent">Shopping List</h1>
                    <div class="ml-auto flex w-full flex-wrap gap-3 sm:w-auto">
                        <Card
                            v-for="(stat, index) in headerStats"
                            :key="index"
                            class="relative flex-1 !border-white/10 !bg-white/5 backdrop-blur-xl sm:flex-none"
                            :class="{
                                'cursor-pointer transition hover:bg-white/10': stat.type === 'select',
                                'cursor-default': stat.type !== 'select'
                            }"
                            @click="stat.type === 'select' ? toggleAllItems() : null"
                        >
                            <template #content>
                                <i v-if="stat.iconInd" class="pi pi-eye absolute top-2 right-2 cursor-pointer text-white hover:text-gray-300" @click.stop="togglePopover"></i>
                                <div class="flex items-center gap-2 p-2 sm:gap-3">
                                    <i :class="[stat.icon, stat.iconColor, 'text-lg sm:text-xl']"></i>
                                    <div>
                                        <div class="text-xl font-bold text-white sm:text-2xl">{{ stat.value }}</div>
                                        <div class="text-xs text-gray-400 uppercase">{{ stat.label }}</div>
                                    </div>
                                </div>
                            </template>
                        </Card>
                        <Popover ref="summaryPopover" :dismissable="true" class="!border-none !bg-[#2a2a40] text-white shadow-lg" pt:arrow="hidden">
                            <div class="p-3">
                                <p class="mb-2 font-semibold text-white">Store Breakdown</p>
                                <ul class="space-y-1 text-sm text-gray-200">
                                    <li v-for="(entry, i) in shoppingListSummary.StoreName" :key="i">🏬 {{ entry.store }} — R{{ entry.totalAmount.toFixed(2) }} ({{ entry.itemCount }} items)</li>
                                </ul>
                            </div>
                        </Popover>
                    </div>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                    <Button label="Export All" icon="pi pi-upload" class="!border-0 !bg-gradient-to-r !from-green-500 !to-emerald-500 hover:opacity-90" @click="exportAll" />
                    <Button v-if="shoppingListItems.some((item) => item.checked)" label="Export Selected" icon="pi pi-cloud-upload" class="!border-0 !bg-gradient-to-r !from-blue-500 !to-indigo-500 hover:opacity-90" @click="exportSelected" />
                    <Button v-if="shoppingListItems.some((item) => item.checked)" label="Remove Selected" icon="pi pi-trash" class="!border-0 !bg-gradient-to-r !from-red-500 !to-pink-500 hover:opacity-90" @click="removeSelected" />
                </div>
                <Card class="!border-white/10 !bg-white/5 backdrop-blur-xl">
                    <template #content>
                        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div class="relative flex-1">
                                <InputText v-model="quickAddSearch" placeholder="Search for an item (coming soon)" disabled class="w-full !border-white/20 !bg-white/10 !text-white placeholder:!text-gray-500" />
                            </div>
                            <Button label="Add Item" icon="pi pi-list" class="!border-0 !bg-gradient-to-r !from-purple-500 !to-pink-500 whitespace-nowrap" @click="openItemModal('Add Item')" />
                        </div>
                    </template>
                </Card>
            </div>

            <div v-if="shoppingListItems.length === 0" class="flex flex-col items-center justify-center py-16">
                <i class="pi pi-shopping-cart mb-4 text-6xl text-gray-600"></i>
                <h2 class="mb-2 text-2xl font-bold text-gray-400">Your shopping list is empty</h2>
                <p class="mb-6 text-gray-500">Start adding items to build your list</p>
                <Button label="Add Your First Item" icon="pi pi-plus" class="!border-0 !bg-gradient-to-r !from-purple-500 !to-pink-500" @click="openItemModal()" />
            </div>
            <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card
                    v-for="item in shoppingListItems"
                    :key="item.id"
                    class="group cursor-pointer !border-white/10 !bg-white/5 backdrop-blur-xl transition-all hover:!bg-white/10"
                    :class="{ 'opacity-60': item.checked }"
                    @click="toggleItemSelected(item)"
                    role="button"
                    :aria-label="`${item.checked ? 'Deselect' : 'Select'} ${item.name}`"
                    :aria-pressed="item.checked"
                    tabindex="0"
                    @keydown.enter="toggleItemSelected(item)"
                    @keydown.space.prevent="toggleItemSelected(item)"
                >
                    <template #content>
                        <div class="space-y-2.5">
                            <div class="flex items-start justify-between">
                                <div class="flex items-center gap-2.5">
                                    <Checkbox v-model="item.checked" binary class="pointer-events-none !h-5 !w-5" :aria-hidden="true" />
                                    <div>
                                        <h3 class="text-base font-bold text-white" :class="{ 'line-through': item.checked }">
                                            {{ item.name }}
                                        </h3>
                                        <div class="text-xs text-gray-400">{{ item.quantity }} x {{ item.unitSize }} {{ item.unit }}</div>
                                    </div>
                                </div>
                                <Button icon="pi pi-ellipsis-v" text rounded class="!text-white" @click.stop="openItemModal('Edit ' + item.name, item)" aria-label="Item options" />
                            </div>
                            <div class="flex items-center justify-between">
                                <Chip :label="item.store" icon="pi pi-building" class="!bg-blue-500/20 text-xs !text-blue-300" />
                                <div class="text-right">
                                    <div class="text-lg font-bold text-white">
                                        {{ formatPrice(item.currentPrice) }}
                                    </div>
                                    <div class="text-xs text-gray-400">Total: {{ formatPrice(item.currentPrice * item.quantity) }}</div>
                                </div>
                            </div>
                            <div class="flex flex-wrap items-center gap-1.5">
                                <Chip v-if="item.category" :label="item.category" class="!bg-purple-500/20 text-xs !text-purple-300" />
                                <Chip v-if="item.onSpecial" label="SPECIAL" icon="pi pi-star-fill" class="!bg-yellow-500/20 text-xs !text-yellow-300" />
                                <Chip v-if="isRecent(item.dateAdded)" label="Recent" icon="pi pi-clock" class="!bg-green-500/20 text-xs !text-green-300" />
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
    </div>

    <DataDialog v-model:visible="addItemModal" :header="modalTitle" :busy="modalBusy" :save-btn-attrs="{ type: 'submit', form: 'itemModifyModalForm' }" @close-modal="cancel" class="w-[90vw] max-w-[600px] sm:w-[600px]">
        <Form id="itemModifyModalForm" :validation-schema="modifyItemSchema" @submit="save">
            <div class="flex flex-col gap-4 text-sm text-white sm:text-base">
                <div class="flex flex-col gap-2">
                    <label for="item" class="font-semibold">Item</label>
                    <VeeSelect
                        :virtualScrollerOptions="{ itemSize: 40, showLoader: true, loadingIcon: 'pi pi-spinner' }"
                        v-model="modalItem.shoppingItemId"
                        name="Item"
                        :options="itemOptions"
                        optionLabel="itemName"
                        optionValue="itemId"
                        placeholder="Select an existing item or create new..."
                        filter
                        showClear
                        class="w-full"
                    />
                    <InputText v-if="modalItem.shoppingItemId == -1" v-model="modalItem.itemName" placeholder="Enter item name" class="w-full" />
                </div>
                <div class="flex flex-col gap-2">
                    <label for="store" class="font-semibold">Store</label>
                    <VeeSelect v-model="modalItem.gcStoreId" name="Store" :options="storeOptions" optionLabel="text" optionValue="id" placeholder="Select a store" showClear class="w-full" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="font-semibold">Unit Size & Measure</label>
                    <div class="flex flex-col gap-3 sm:flex-row">
                        <div class="w-full sm:w-[40%]">
                            <VeeInputNumber v-model="modalItem.unitSize" name="Unit Size" inputId="unitSize" placeholder="Enter unit size" class="w-full" />
                        </div>
                        <div class="w-full sm:flex-1">
                            <VeeSelect v-model="modalItem.gcUnitOfMeasure" name="Unit Of Measure" :options="unitOptions" optionLabel="text" optionValue="id" placeholder="Select unit" showClear class="w-full" />
                        </div>
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <label for="quantity" class="font-semibold">Quantity</label>
                    <VeeInputNumber v-model="modalItem.quantity" name="Quantity" inputId="quantity" placeholder="Enter quantity" class="w-full" />
                </div>
                <div class="flex flex-col gap-2">
                    <label for="category" class="font-semibold">Category</label>
                    <VeeSelect v-model="modalItem.gcCategoryId" name="Category" :options="categoryOptions" optionLabel="text" optionValue="id" placeholder="Select a category" showClear class="w-full" />
                </div>
                <div class="flex flex-col gap-2">
                    <label for="price" class="font-semibold">Price</label>
                    <VeeInputNumber
                        v-model="modalItem.currentPrice"
                        name="Price"
                        inputId="price"
                        placeholder="Enter price"
                        mode="decimal"
                        prefix="R "
                        locale="en-ZA"
                        :minFractionDigits="2"
                        :maxFractionDigits="2"
                        :useGrouping="false"
                        inputMode="numeric"
                        class="w-full"
                    />
                </div>
            </div>
        </Form>
    </DataDialog>

    <DataDialog v-model:visible="exportModalVisible" :busy="modalBusy" :hide-footer="true" header="Export Items">
        <div class="flex h-full flex-col gap-4">
            <div class="flex gap-2">
                <Select v-model="exportTarget" :options="exportOptions" optionLabel="text" optionValue="id" placeholder="Select export target" class="flex-1" />
            </div>
            <div class="mb-2 flex gap-4">
                <div class="flex items-center gap-1">
                    <Checkbox v-model="includeOptions.quantity" binary />
                    <span class="text-sm text-white">Quantity</span>
                </div>
                <div class="flex items-center gap-1">
                    <Checkbox v-model="includeOptions.unit" binary />
                    <span class="text-sm text-white">Unit</span>
                </div>
                <div class="flex items-center gap-1">
                    <Checkbox v-model="includeOptions.price" binary />
                    <span class="text-sm text-white">Price</span>
                </div>
                <Button label="Generate" icon="pi pi-cog" :disabled="!exportTarget" @click="generateExport" class="ml-auto" />
            </div>
            <div class="relative w-full flex-1">
                <div class="hide-scrollbar prose prose-invert h-full w-full overflow-y-auto rounded bg-white/5 p-4 text-white">
                    <template v-if="exportTarget === 1">
                        <template v-if="exportPreview && exportPreview.length">
                            <pre class="text-lg break-words whitespace-pre-wrap">{{ exportPreview }}</pre>
                        </template>
                        <template v-else>
                            <div class="mt-10 text-center text-lg text-gray-400">Please generate new list</div>
                        </template>
                    </template>
                    <template v-else-if="exportTarget === 2">
                        <template v-if="exportPreview && exportPreview.length">
                            <div v-html="renderedPreview"></div>
                        </template>
                        <template v-else>
                            <div class="mt-10 text-center text-lg text-gray-400">Please generate new list</div>
                        </template>
                    </template>
                    <template v-else>
                        <div class="mt-10 text-center text-lg text-gray-400">Please select an export target</div>
                    </template>
                </div>
                <button v-if="exportPreview && exportPreview.length" @click="copyToClipboard" aria-label="Copy list" class="absolute top-2 right-2 rounded-full border-none bg-transparent p-2 text-white shadow-none transition hover:bg-white/10">
                    <i class="pi pi-copy text-xl text-white"></i>
                </button>
            </div>
        </div>
    </DataDialog>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
    display: none;
}
.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
