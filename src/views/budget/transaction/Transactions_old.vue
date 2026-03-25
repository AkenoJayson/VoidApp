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
import debounce from 'lodash-es/debounce';

//Variables
const toast = useToast();
const transactionDtGearMenu = ref();
const transactionApiDt = ref();
const transactionAddEditModalVisible = ref(false);
const transactionDtFilterDrawerVisible = ref(false);
const statusOptions = ref([]);
const siteOptions = ref([]);
const assignedUserOptions = ref([]);
const totalRowsBadgeInfo = computed(() => String(transactionApiDt.value?.dtValue.totalRows ?? 'NA'));
const modalTitle = ref('');
const modalItemDefault = ref({});
const modalItem = ref();
const transactionDtGearMenuItems = ref();
const modalBusy = ref(false);
const pageTempSearch = ref('');
const initialFilter = {
    search: null,
    statusId: null
};
const filter = ref({ ...initialFilter });
const selectedSite = ref(null);
const selectedManager = ref(null);

const modifyTransactionSchema = Yup.object().shape({
    Department: Yup.string().required().min(3),
    Site: Yup.string().required().min(3)
});

const openModal = (title, item) => {
    modalItem.value = { ...modalItemDefault.value };
    if (item) {
        modalItem.value = { ...item };
        selectedSite.value = modalItem.value.SiteId;
        selectedManager.value = modalItem.value.ManagerUserId;
    } else {
    }
    modalTitle.value = title;
    transactionAddEditModalVisible.value = true;
};

const onRowAction = (rowData, event) => {
    transactionDtGearMenuItems.value = [{ label: 'Edit', icon: 'pi pi-pencil', command: () => openModal('Edit Transaction', rowData) }];

    transactionDtGearMenu.value.toggle(event);
};

const save = async () => {
    modalBusy.value = true;
    try {
        //await DepartmentServiceN.Save(modalItem.value);
        toast.add({ severity: 'success', detail: 'Saved!', life: 3000, position: 'middle' });
        transactionApiDt.value.refresh();
        closeModal();
    } catch (e) {
        handleAxiosError(e, toast);
    } finally {
        modalBusy.value = false;
    }
};

const closeModal = () => {
    transactionAddEditModalVisible.value = false;
    selectedSite.value = null;
    selectedManager.value = null;
};

const pageSearch = async (data) => {
    if (pageTempSearch.value.length > 2 || pageTempSearch.value.length === 0) filter.value.search = pageTempSearch.value;
};

const debouncedPageSearch = debounce(pageSearch, 300);

onMounted(async () => {
    transactionApiDt.value.dtValue.sortBy = 'date';
    transactionApiDt.value.dtValue.sortDesc = 1;
});
</script>

<template>
    <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12">
            <div class="card">
                <div class="flex pb-2">
                    <div class="flex-none text-2xl font-semibold">Status</div>
                    <div class="flex-auto"></div>
                    <div class="hidden md:block">
                        <Button type="button" label="Rows" :badge="totalRowsBadgeInfo" severity="secondary" badgeClass="!bg-[#6c757d] !text-[#fff]" />
                    </div>
                    <ClearFilterButton v-model:filter="filter" :initialFilter="initialFilter" class="ml-2" @filterCleared="pageTempSearch = ''" />
                    <Button @click="transactionDtFilterDrawerVisible = !transactionDtFilterDrawerVisible" severity="secondary" class="!-mt-2 flex-none" text rounded><i class="pi pi-filter !text-lg"></i></Button>
                    <Button @click="transactionApiDt.refresh()" severity="secondary" class="!-mt-2 flex-none" text rounded><i class="pi pi-refresh !text-lg"></i></Button>
                    <Button @click="openModal('Create Transaction', null)" severity="secondary" class="!-mt-2 flex-none" text rounded><i class="pi pi-plus !text-lg"></i></Button>
                </div>
                <ApiDataTable ref="transactionApiDt" api-url="api/transaction/page" :filter="filter">
                    <!-- <Column field="Id" header="Id" sortable></Column> -->
                    <Column field="id" header="Ref" sortable></Column>
                    <Column field="description" header="Description" sortable></Column>
                    <Column field="date" header="Date" sortable></Column>
                    <Column field="amount" header="Amount" sortable>
                        <template #body="slotProps">
                            <div>R {{ slotProps.data.amount }}</div>
                        </template>
                    </Column>
                    <Column field="subCategory" header="Sub-Category" sortable></Column>
                    <Column field="category" header="Category" sortable></Column>
                    <Column headerStyle="width: 5rem; text-align: center" bodyStyle="text-align: center; overflow: visible">
                        <template #body="slotProps">
                            <Button @click="onRowAction(slotProps.data, $event)" severity="secondary" text rounded><i class="pi pi-cog !text-lg"></i></Button>
                        </template>
                    </Column>
                </ApiDataTable>
            </div>
        </div>
    </div>

    <TieredMenu ref="transactionDtGearMenu" :model="transactionDtGearMenuItems" popup />
    <DataDialog v-model:visible="transactionAddEditModalVisible" :header="modalTitle" :busy="modalBusy" @close-modal="closeModal" :style="{ width: '500px' }" :save-btn-attrs="{ type: 'submit', form: 'TransactionModifyModalForm' }">
        <Form id="TransactionModifyModalForm" :validation-schema="modifyTransactionSchema" @submit="save"></Form>
    </DataDialog>

    <Drawer v-model:visible="transactionDtFilterDrawerVisible" header="Filters" position="right" :modal="false">
        <div class="mb-2 flex flex-col flex-wrap sm:flex-row">
            <div class="my-flex-col w-full sm:w-auto">
                <label for="searchFilter">Search</label>
                <InputText @input="debouncedPageSearch" type="text" id="searchFilter" v-model="pageTempSearch" class="flex-auto" autofocus="true" placeholder="Search" />
            </div>
        </div>
        <div class="flex flex-col flex-wrap sm:flex-row">
            <div class="my-flex-col w-full sm:w-auto">
                <label for="statusFilter">Status</label>
                <Select v-model="filter.statusId" id="statusFilter" :options="statusOptions" optionLabel="text" optionValue="id" placeholder="Please Select" class="flex-auto" showClear />
            </div>
        </div>
    </Drawer>
</template>
