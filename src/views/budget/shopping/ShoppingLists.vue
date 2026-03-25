<script setup>
import ApiDataTable from '@/components/vue/ApiDataTable.vue';
import DataDialog from '@/components/vue/DataDialog.vue';
import handleAxiosError from '@/scripts/axios/Error';
import { format } from 'date-fns';
import { useToast } from 'primevue/usetoast';
import { Form } from 'vee-validate';
import { computed, onMounted, ref, watch } from 'vue';
import * as Yup from 'yup';
import ClearFilterButton from '@/components/vue/ClearFilterButton.vue';
import { DEFAULT_DATETIME_FORMAT, DEFAULTDATEFORMAT } from '@/scripts/constants/DefaultDateFormats';
import debounce from 'lodash-es/debounce';
import ShoppingBudgetService from '@/services/voidapi/budget/ShoppingBudgetService';
import { useRoute } from 'vue-router';
import router from '@/router';
import ShoppingListService from '@/services/voidapi/budget/shopping/ShoppingListService';
import VeeInputText from '@/components/validation/VeeInputText.vue';
import { useAuthStore } from '@/stores/security/user/AuthStore';
import VeeSelect from '@/components/validation/VeeSelect.vue';

//Variables
const toast = useToast();
const shoppingListApiDt = ref();
const shoppingListAddEditModalVisible = ref(false);
const shoppingListDtFilterDrawerVisible = ref(false);
const groupOptions = ref([]);
const totalRowsBadgeInfo = computed(() => String(shoppingListApiDt.value?.dtValue.totalRows ?? 'NA'));
const modalTitle = ref('');
const modalItemDefault = ref({});
const modalItem = ref();
const modalBusy = ref(false);
const pageTempSearch = ref('');
const initialFilter = {
    search: null,
    statusId: null
};
const filter = ref({ ...initialFilter });
const selectedSite = ref(null);
const selectedManager = ref(null);

const modifyShoppingListSchema = Yup.object().shape({
    'List Name': Yup.string().required(),
    Group: Yup.string().required(),
    'New Group Name': Yup.string().required()
});

//Functions

const openModal = (title, item) => {
    modalItem.value = { ...modalItemDefault.value };
    if (item) {
        modalItem.value = { ...item };
    } else {
    }
    modalTitle.value = title;
    shoppingListAddEditModalVisible.value = true;
};

const navigateToShoppingListItems = (rowData) => {
    const params = new URLSearchParams({
        id: rowData.id,
        groupId: rowData.groupId
    }).toString();

    window.location.href = `/budget/shoppinglistitems?${params}`;
};

const save = async () => {
    modalBusy.value = true;
    try {
        modalItem.value.UserId = useAuthStore().userId;
        await ShoppingListService.Save(modalItem.value);
        toast.add({ severity: 'success', detail: 'Saved!', life: 3000, position: 'middle' });
        shoppingListApiDt.value.refresh();
        closeModal();
    } catch (e) {
        handleAxiosError(e, toast);
    } finally {
        modalBusy.value = false;
    }
};

const GetGroupDropdown = async () => {
    try {
        const response = await ShoppingListService.GetGroupDropdown();
        groupOptions.value = [
            { id: 0, text: '➕ Create New' }, // always add this option first
            ...response.data
        ];
    } catch (e) {
        handleAxiosError(e, toast);
    }
};

const closeModal = () => {
    shoppingListAddEditModalVisible.value = false;
    selectedSite.value = null;
    selectedManager.value = null;
};

const pageSearch = async (data) => {
    if (pageTempSearch.value.length > 2 || pageTempSearch.value.length === 0) filter.value.search = pageTempSearch.value;
};

const pageRefresh = async () => {
    shoppingListApiDt.value.refresh();
};

const debouncedPageSearch = debounce(pageSearch, 300);

onMounted(async () => {
    modalItem.UserId = useAuthStore().userId;
    shoppingListApiDt.value.dtValue.sortBy = 'date';
    shoppingListApiDt.value.dtValue.sortDesc = 1;
    await GetGroupDropdown();
});
</script>

<template>
    <div>
        <div class="card">
            <div class="flex pb-2">
                <div class="flex text-2xl font-semibold">Shopping Lists</div>
                <div class="flex-auto"></div>
                <Button type="button" label="Rows" :badge="totalRowsBadgeInfo" severity="secondary" badgeClass="!bg-[#6c757d] !text-[#fff]" class="mr-2" />
                <div class="hidden md:block"></div>
                <ClearFilterButton v-model:filter="filter" :initialFilter="initialFilter" class="ml-2" @filterCleared="pageTempSearch = ''" />
                <!-- <Button @click="exportExcelDownload()" severity="secondary" class="!-mt-2 flex-none" text rounded><i class="pi pi-file-export !text-lg"></i></Button> -->
                <Button @click="shoppingListDtFilterDrawerVisible = !shoppingListDtFilterDrawerVisible" severity="secondary" class="!-mt-2 flex-none" text rounded><i class="pi pi-filter !text-lg"></i></Button>
                <Button @click="pageRefresh()" severity="secondary" class="!-mt-2 flex-none" text rounded><i class="pi pi-refresh !text-lg"></i></Button>
                <Button @click="openModal('Create Transaction', null)" severity="secondary" class="!-mt-2 flex-none" text rounded><i class="pi pi-plus !text-lg"></i></Button>
            </div>
            <ApiDataTable ref="shoppingListApiDt" api-url="/api/budget/shoppinglist/page" :filter="filter">
                <Column field="descr" header="Description" sortable></Column>
                <Column field="lastItemAdded" header="Last Item Added" sortable>
                    <template #body="slotProps">
                        {{ slotProps.data.lastItemAdded ? format(slotProps.data.lastItemAdded, DEFAULT_DATETIME_FORMAT) : 'No Items Added' }}
                    </template>
                </Column>
                <Column field="totalCost" header="Total Cost" sortable>
                    <template #body="slotProps"> R{{ slotProps.data.totalCost ?? 'NA' }} </template>
                </Column>
                <Column headerStyle="width: 8rem; text-align: center" bodyStyle="text-align: center; overflow: hidden">
                    <template #body="slotProps">
                        <div class="flex justify-center gap-2">
                            <Button icon="pi pi-pencil" severity="secondary" text rounded tooltip="Edit" @click="openModal('Assign Users', slotProps.data)" />
                            <Button icon="pi pi-eye" severity="secondary" text rounded tooltip="View Items" @click="navigateToShoppingListItems(slotProps.data)" />
                        </div>
                    </template>
                </Column>
            </ApiDataTable>
        </div>
    </div>

    <DataDialog v-model:visible="shoppingListAddEditModalVisible" :header="modalTitle" :busy="modalBusy" @close-modal="closeModal" :save-btn-attrs="{ type: 'submit', form: 'editShoppingListModalForm' }">
        <Form id="editShoppingListModalForm" :validation-schema="modifyShoppingListSchema" @submit="save">
            <div class="flex grow flex-col gap-2">
                <label for="Group Name">List Name</label>
                <VeeInputText id="Group Name" name="List Name" v-model="modalItem.descr" />
            </div>
            <div class="flex grow flex-col gap-2">
                <label for="group">Group</label>
                <VeeSelect id="groupId" name="Group" :options="groupOptions" placeholder="Select a group" optionValue="id" optionLabel="text" v-model="modalItem.groupId" filter showClear />
            </div>
            <div v-if="modalItem.groupId === 0" class="flex grow flex-col gap-2">
                <label for="newGroup">New Group Name</label>
                <VeeInputText id="newGroup" name="New Group Name" v-model="modalItem.GroupName" />
            </div>
        </Form>
    </DataDialog>

    <Drawer v-model:visible="shoppingListDtFilterDrawerVisible" :dismissable="false" header="Filters" position="right" :modal="false">
        <div class="mb-2 flex flex-col flex-wrap sm:flex-row">
            <div class="my-flex-col w-full sm:w-auto">
                <label for="searchFilter">Search</label>
                <InputText @input="debouncedPageSearch" type="text" id="searchFilter" v-model="pageTempSearch" class="flex-auto" autofocus="true" placeholder="Search" />
            </div>
        </div>
    </Drawer>
</template>
