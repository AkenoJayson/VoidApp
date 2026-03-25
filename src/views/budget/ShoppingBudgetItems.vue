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
    Title: Yup.string().required().min(3),
    Description: Yup.string().required().min(3),
    'Budgeted Amount': Yup.string().required().min(3),
    'Actual Amount': Yup.string().required().min(3),
    'Shopping Date': Yup.string().required()
});

//Functions
const shoppingDate = computed({
    get() {
        return modalItem.value.shoppingDate ? new Date(modalItem.value.shoppingDate) : null;
    },
    set(newValue) {
        modalItem.value.shoppingDate = newValue ? format(newValue, 'yyyy-MM-dd') : null;
    }
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
        await ShoppingBudgetService.Save(modalItem.value);
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
    <div class="mb-8 grid grid-cols-12 gap-8">
        <div class="col-span-12">
            <div class="flex flex-col items-center gap-6 sm:flex-row">
                <div class="flex flex-col items-center gap-4 sm:flex-row">
                    <img alt="avatar" src="/layout/images/profile.png" class="h-16 w-16 flex-shrink-0" />
                    <div class="flex flex-col items-center sm:items-start">
                        <span class="text-4xl font-bold text-surface-900 dark:text-surface-0">{{ leaseDetails.LeaseUser }}</span>
                        <p class="m-0 text-surface-600 dark:text-surface-200"></p>
                        {{ leaseDetails.VehicleRegistration }}
                    </div>
                </div>
                <div class="flex gap-2 sm:ml-auto">
                    <Select v-model="filter.AgreementId" :options="leaseOptions" optionLabel="Text" class="w-[20rem]" optionValue="Id" filter placeholder="Select a  Lease" />
                    <Button @click="processLeaseInstallments()" title="Process Lease Installments" severity="secondary" class="!-mt-2 flex-none" text rounded><i class="pi pi-bolt !text-lg"></i></Button>
                </div>
            </div>
        </div>
        <div class="col-span-12 md:col-span-6 xl:col-span-4">
            <div class="card relative h-full overflow-hidden">
                <!-- Active Card -->
                <svg v-if="leaseDetails.StatusId == 10475" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" class="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                    <rect width="900" height="600" fill="#283a8c" />
                    <path
                        d="M0 400L30 386.5C60 373 120 346 180 334.8C240 323.7 300 328.3 360 345.2C420 362 480 391 540 392C600 393 660 366 720 355.2C780 344.3 840 349.7 870 352.3L900 355L900 601L870 601C840 601 780 601 720 601C660 601 600 601 540 601C480 601 420 601 360 601C300 601 240 601 180 601C120 601 60 601 30 601L0 601Z"
                        fill="#3b4db7"
                        stroke-linecap="round"
                        stroke-linejoin="miter"
                    />
                </svg>
                <!-- Active with Agreement -->
                <svg v-if="leaseDetails.StatusId == 10476" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" class="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                    <rect width="900" height="600" fill="#3f3a8c" />
                    <path
                        d="M0 400L30 386.5C60 373 120 346 180 334.8C240 323.7 300 328.3 360 345.2C420 362 480 391 540 392C600 393 660 366 720 355.2C780 344.3 840 349.7 870 352.3L900 355L900 601L870 601C840 601 780 601 720 601C660 601 600 601 540 601C480 601 420 601 360 601C300 601 240 601 180 601C120 601 60 601 30 601L0 601Z"
                        fill="#5750b7"
                        stroke-linecap="round"
                        stroke-linejoin="miter"
                    />
                </svg>
                <!-- Completed Card -->
                <svg v-if="leaseDetails.StatusId == 10477" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" class="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                    <rect width="900" height="600" fill="#008040" />
                    <path
                        d="M0 400L30 386.5C60 373 120 346 180 334.8C240 323.7 300 328.3 360 345.2C420 362 480 391 540 392C600 393 660 366 720 355.2C780 344.3 840 349.7 870 352.3L900 355L900 601L870 601C840 601 780 601 720 601C660 601 600 601 540 601C480 601 420 601 360 601C300 601 240 601 180 601C120 601 60 601 30 601L0 601Z"
                        fill="#00b359"
                        stroke-linecap="round"
                        stroke-linejoin="miter"
                    />
                </svg>
                <!-- Pending Card -->
                <svg v-if="leaseDetails.StatusId == 10474" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" class="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                    <rect width="900" height="600" fill="#d4af00" />
                    <path
                        d="M0 400L30 386.5C60 373 120 346 180 334.8C240 323.7 300 328.3 360 345.2C420 362 480 391 540 392C600 393 660 366 720 355.2C780 344.3 840 349.7 870 352.3L900 355L900 601L870 601C840 601 780 601 720 601C660 601 600 601 540 601C480 601 420 601 360 601C300 601 240 601 180 601C120 601 60 601 30 601L0 601Z"
                        fill="#e2d003"
                        stroke-linecap="round"
                        stroke-linejoin="miter"
                    />
                </svg>
                <!-- Terminated Card -->
                <svg v-if="leaseDetails.StatusId == 10478" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" class="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                    <rect width="900" height="600" fill="#800000" />
                    <path
                        d="M0 400L30 386.5C60 373 120 346 180 334.8C240 323.7 300 328.3 360 345.2C420 362 480 391 540 392C600 393 660 366 720 355.2C780 344.3 840 349.7 870 352.3L900 355L900 601L870 601C840 601 780 601 720 601C660 601 600 601 540 601C480 601 420 601 360 601C300 601 240 601 180 601C120 601 60 601 30 601L0 601Z"
                        fill="#b30000"
                        stroke-linecap="round"
                        stroke-linejoin="miter"
                    />
                </svg>
                <div class="relative z-20 text-white">
                    <div class="mb-4 flex items-center justify-between text-xl font-semibold">
                        {{ leaseDetails.PackageName }}
                        <button class="pi pi-pencil !text-xl text-white" @click="navigateToLease()"></button>
                    </div>
                    <div class="mb-1 font-semibold">Status</div>
                    <div class="mb-8 text-2xl font-bold">{{ leaseDetails.StatusDesc }}</div>
                    <div class="flex items-center justify-between">
                        <span class="text-lg">Cell - {{ leaseDetails.Cell }}</span>
                        <span class="text-lg"> Email - {{ leaseDetails.Email }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-span-12 md:col-span-6 xl:col-span-2">
            <div class="card h-full">
                <div class="mb-4 flex items-center justify-between">
                    <div class="text-xl font-semibold text-surface-900 dark:text-surface-0">Billing</div>
                </div>
                <div class="mb-1 font-semibold text-surface-600 dark:text-surface-200">Next Installment</div>
                <div class="mb-8 text-2xl font-bold text-[#283a8c]">R{{ leaseDetails.NextInstallment }}</div>
                <div class="flex items-center justify-between">
                    <span class="text-lg text-surface-900 dark:text-surface-0">{{ leaseDetails.NextInstallmentDate }}</span>
                </div>
            </div>
        </div>
        <div class="col-span-12 md:col-span-6 xl:col-span-2">
            <div class="card flex h-full flex-col items-center justify-center">
                <i class="pi pi-wallet mb-6 !text-4xl text-[#283a8c]"></i><span class="mb-6 text-lg font-medium text-surface-900 dark:text-surface-0">Installments</span
                ><span class="text-2xl font-bold text-[#283a8c]">{{ leaseDetails.TotalInstallments }}</span>
            </div>
        </div>
        <div class="col-span-12 md:col-span-6 xl:col-span-2">
            <div class="card flex h-full flex-col items-center justify-center">
                <i class="pi pi-credit-card mb-6 !text-4xl text-[#283a8c]"></i><span class="mb-6 text-lg font-medium text-surface-900 dark:text-surface-0">Balance Owed</span>
                <span class="text-2xl font-bold text-[#283a8c]">R{{ leaseDetails.BalanceOwed }}</span>
            </div>
        </div>
        <div class="col-span-12 md:col-span-6 xl:col-span-2">
            <div class="card flex h-full flex-col items-center justify-center">
                <i class="pi pi-dollar mb-6 !text-4xl text-[#283a8c]"></i><span class="mb-6 text-lg font-medium text-surface-900 dark:text-surface-0">Earned Today</span
                ><span class="text-2xl font-bold text-[#283a8c]">R{{ leaseDetails.TodayEarnings }} ({{ leaseDetails.TodayTrips }})</span>
            </div>
        </div>
    </div>
    <div>
        <div class="card">
            <div class="flex pb-2">
                <div class="flex text-2xl font-semibold">Transactions</div>
                <div class="flex-auto"></div>
                <Button type="button" label="Rows" :badge="totalRowsBadgeInfo" severity="secondary" badgeClass="!bg-[#6c757d] !text-[#fff]" class="mr-2" />
                <div class="hidden md:block"></div>
                <ClearFilterButton v-model:filter="filter" :initialFilter="initialFilter" class="ml-2" @filterCleared="pageTempSearch = ''" />
                <!-- <Button @click="exportExcelDownload()" severity="secondary" class="!-mt-2 flex-none" text rounded><i class="pi pi-file-export !text-lg"></i></Button> -->
                <Button @click="transactionDtFilterDrawerVisible = !transactionDtFilterDrawerVisible" severity="secondary" class="!-mt-2 flex-none" text rounded><i class="pi pi-filter !text-lg"></i></Button>
                <Button @click="pageRefresh()" severity="secondary" class="!-mt-2 flex-none" text rounded><i class="pi pi-refresh !text-lg"></i></Button>
                <Button @click="openEditTransactionModal('Create Transaction', null)" severity="secondary" class="!-mt-2 flex-none" text rounded><i class="pi pi-plus !text-lg"></i></Button>
            </div>
            <ApiDataTable ref="transactionApiDt" api-url="/api/shoppingbudgetitem/page" :filter="filter">
                <Column field="Id" header="Ref" sortable></Column>
                <Column field="TranDate" header="Transaction Date" sortable>
                    <template #body="slotProps">
                        {{ slotProps.data.TranDate ? format(slotProps.data.TranDate, DEFAULT_DATETIME_FORMAT) : 'NA' }}
                    </template>
                </Column>
                <Column field="Amount" header="Amount" sortable>
                    <template #body="slotProps">
                        <div>R {{ slotProps.data.Amount }}</div>
                    </template>
                </Column>
                <Column field="TranTypeDesc" header="Transaction Type" sortable></Column>
                <Column field="RunningBalance" header="Balance" sortable>
                    <template #body="slotProps">
                        <div>R {{ slotProps.data.RunningBalance }}</div>
                    </template>
                </Column>
                <Column field="CreatedByUserName" header="Captured By" sortable></Column>
                <Column headerStyle="width: 5rem; text-align: center" bodyStyle="text-align: center; overflow: hidden">
                    <template #body="slotProps">
                        <Button @click="onRowAction(slotProps.data, $event)" severity="secondary" text rounded>
                            <i class="pi pi-cog !text-lg"></i>
                        </Button>
                    </template>
                </Column>
            </ApiDataTable>
        </div>
    </div>

    <TieredMenu ref="transactionDtGearMenu" :model="transactionDtGearMenuItems" popup />

    <DataDialog v-model:visible="editTransactionModal" :header="modalTitle" :busy="modalBusy" @close-modal="closeModal" :save-btn-attrs="{ type: 'submit', form: 'editTransactionModalForm' }">
        <Form id="editTransactionModalForm" :validation-schema="modifyTransactionSchema" @submit="save">
            <div class="mb-4 flex flex-col flex-wrap gap-2">
                <label for="lease">Lease</label>
                <VeeSelect id="lease" disabled name="Lease" v-model="modalItem.AgreementId" :options="leaseOptions" optionLabel="Text" optionValue="Id" placeholder="Select a Lease" />
            </div>
            <div class="mb-4 flex flex-col flex-wrap gap-2">
                <label for="tranDate">Transaction Date</label>
                <VeeDatePicker id="tranDate" name="Transaction Date" v-model="tranDate" placeholder="Transaction Date" />
            </div>
            <div class="mb-4 flex flex-col flex-wrap gap-2">
                <label for="tranType">Transaction Type</label>
                <VeeSelect id="tranType" name="Transaction Type" showClear v-model="modalItem.TranTypeId" :options="transactionTypeOptions" optionLabel="Text" optionValue="Id" placeholder="Select a Transaction Type" />
            </div>
            <div class="mb-4 flex flex-col flex-wrap gap-2">
                <label for="amount">Amount</label>
                <VeeInputText id="amount" name="Amount" type="number" v-model="modalItem.Amount" placeholder="Amount" />
            </div>
            <div class="mb-4 flex flex-col flex-wrap gap-2">
                <label for="note">Note</label>
                <TextArea v-model="modalItem.Note" placeholder="Note" maxlength="5000" class="mt-2 h-20 w-full rounded border border-gray-300 p-2" />
            </div>
            <div v-if="isEditModal" class="text-sm text-gray-400">
                <div class="flex flex-wrap gap-2">
                    <label for="Created">Created:</label>
                    <label for="CreatedUser">{{ modalItem.CreatedByUserName ? modalItem.CreatedByUserName : '' }}: {{ modalItem.CreatedDatetime ? format(modalItem.CreatedDatetime, DEFAULT_DATETIME_FORMAT) : '' }}</label>
                </div>
            </div>
        </Form>
    </DataDialog>

    <Drawer v-model:visible="transactionDtFilterDrawerVisible" :dismissable="false" header="Filters" position="right" :modal="false">
        <div class="mb-2 flex flex-col flex-wrap sm:flex-row">
            <div class="mb-4 flex grow basis-0 flex-col gap-2">
                <label for="TranType">Transaction Type</label>
                <Select v-model="filter.TranTypeId" :options="transactionTypeOptions" optionLabel="Text" optionValue="Id" showClear filter placeholder="Select a  Transaction Type" />
            </div>
        </div>
        <div class="flex flex-col flex-wrap sm:flex-row">
            <div class="my-flex-col w-full sm:w-auto">
                <label for="statusFilter">Date Range</label>
                <VueDatePicker v-model="filter.dateRange" :range="{ partialRange: false }" :enable-time-picker="false"></VueDatePicker>
            </div>
        </div>
    </Drawer>
</template>
