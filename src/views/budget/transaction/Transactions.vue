<script setup>
import ApiDataTable from '@/components/vue/ApiDataTable.vue';
import { DEFAULT_DATETIME_FORMAT } from '@/scripts/constants/DefaultDateFormats';
import TransactionService from '@/services/voidapi/budget/transaction/TransactionService';
import { HttpStatusCode } from 'axios';
import { ref, computed } from 'vue';
import { format } from 'date-fns';
import DataDialog from '@/components/vue/DataDialog.vue';

//Variables
const isModalOpen = ref(false);
const finalTable = ref();
const stagingTable = ref();
const fileInput = ref(null);
const uploadStatus = ref('');
const results = ref(null);
const isUploading = ref(false);
const isCleaning = ref(false);
const isProcessing = ref(false);
const totalRowsBadgeInfo = computed(() => String(finalTable.value?.dtValue.totalRows ?? 'NA'));

//Functions
const openModal = () => {
    isModalOpen.value = true;
    uploadStatus.value = '';
    results.value = null;
    if (fileInput.value) fileInput.value.value = '';
};

const closeModal = () => {
    isModalOpen.value = false;
    finalTable.value?.refresh();
};

const handleFileUpload = async () => {
    const file = fileInput.value?.files[0];

    if (!file) {
        alert('Please select a file first.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        isUploading.value = true;
        uploadStatus.value = 'Uploading...';
        results.value = null;

        const response = await TransactionService.UploadCsv(formData);

        if (response.status !== HttpStatusCode.Ok) {
            throw new Error('Upload failed');
        }

        const data = response.data;
        results.value = data;
        uploadStatus.value = 'Upload successful!';

        if (fileInput.value) fileInput.value.value = '';
        stagingTable.value?.refresh();
    } catch (error) {
        console.error('Error:', error);
        uploadStatus.value = `Error: ${error.message}`;
    } finally {
        isUploading.value = false;
    }
};

const handleCleanupStg = async () => {
    try {
        isCleaning.value = true;
        alert('Cleanup triggered');
        stagingTable.value?.refresh();
    } catch (error) {
        console.error('Cleanup failed', error);
    } finally {
        isCleaning.value = false;
    }
};

const handleProcessToFinal = async () => {
    try {
        isProcessing.value = true;
        await TransactionService.MigrateStagingToFinal();
        finalTable.value?.refresh();
        alert('Processed to final successfully');
    } catch (error) {
        console.error('Processing failed', error);
    } finally {
        isProcessing.value = false;
    }
};

const pageRefresh = () => {
    finalTable.value?.refresh();
    stagingTable.value?.refresh();
};
</script>

<template>
    <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12">
            <div class="card">
                <div class="flex items-center gap-2 pb-2">
                    <div class="flex-none text-2xl font-semibold">Transaction Management</div>
                    <div class="flex-auto"></div>

                    <!-- Row count badge -->
                    <div class="hidden md:block">
                        <Button type="button" label="Rows" :badge="totalRowsBadgeInfo" severity="secondary" badgeClass="!bg-[#6c757d] !text-[#fff]" />
                    </div>

                    <!-- Upload / Manage Staging -->
                    <button @click="openModal" class="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                        Upload / Manage Staging
                    </button>

                    <!-- Process to Final -->
                    <button @click="handleProcessToFinal" :disabled="isProcessing" class="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                            />
                        </svg>
                        {{ isProcessing ? 'Processing...' : 'Process to Final' }}
                    </button>

                    <!-- Refresh -->
                    <Button @click="pageRefresh()" severity="secondary" class="flex-none" text rounded>
                        <i class="pi pi-refresh !text-lg"></i>
                    </Button>
                </div>

                <ApiDataTable ref="finalTable" api-url="/api/transaction/TransactionFinalPage">
                    <Column field="id" header="Ref" sortable />

                    <Column field="description" header="Description" sortable />

                    <Column field="transactionDate" header="Transaction Date" sortable>
                        <template #body="slotProps">
                            {{ format(slotProps.data.transactionDate, DEFAULT_DATETIME_FORMAT) }}
                        </template>
                    </Column>

                    <!-- Amount: green for income rows -->
                    <Column field="amount" header="Amount" sortable>
                        <template #body="slotProps">
                            <span :class="slotProps.data.category === 'Income' ? 'font-medium text-emerald-400' : ''"> R {{ slotProps.data.amount }} </span>
                        </template>
                    </Column>

                    <!-- Fee: dim when zero, red when non-zero -->
                    <Column field="fee" header="Fee" sortable>
                        <template #body="slotProps">
                            <span :class="slotProps.data.fee === 0 || slotProps.data.fee === '0' ? 'text-slate-600' : 'text-red-400'"> R {{ slotProps.data.fee }} </span>
                        </template>
                    </Column>

                    <!-- Category: coloured pill — colour controlled by data-cat in datatable.scss -->
                    <Column field="category" header="Category" sortable>
                        <template #body="slotProps">
                            <span class="category-pill" :data-cat="slotProps.data.category">
                                {{ slotProps.data.category }}
                            </span>
                        </template>
                    </Column>

                    <Column field="subCategory" header="Subcategory" sortable />
                </ApiDataTable>
            </div>
        </div>
    </div>

    <!-- Replaced Custom Modal with DataDialog Wrapper -->
    <DataDialog v-model:visible="isModalOpen" header="Staging Area" :busy="isUploading || isCleaning" :hide-footer="true">
        <div class="p-1">
            <div class="mb-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6">
                <h4 class="mb-4 text-sm font-semibold text-gray-500 uppercase">Import New Records</h4>

                <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <input
                        type="file"
                        ref="fileInput"
                        accept=".csv"
                        :disabled="isUploading"
                        class="block w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-700 disabled:opacity-50"
                    />
                    <button @click="handleFileUpload" :disabled="isUploading" class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
                        {{ isUploading ? 'Uploading...' : 'Upload CSV' }}
                    </button>
                </div>
                <div v-if="results" class="mt-4">
                    <div class="grid grid-cols-3 gap-2 text-center text-sm">
                        <div class="rounded border bg-white p-2 shadow-sm">
                            <div class="text-xs text-gray-500 uppercase">Total</div>
                            <div class="font-bold text-gray-900">{{ results.totalRows }}</div>
                        </div>
                        <div class="rounded border bg-white p-2 shadow-sm">
                            <div class="text-xs text-gray-500 uppercase">Added</div>
                            <div class="font-bold text-green-600">{{ results.inserted }}</div>
                        </div>
                        <div class="rounded border bg-white p-2 shadow-sm">
                            <div class="text-xs text-gray-500 uppercase">Dups</div>
                            <div class="font-bold text-amber-600">{{ results.duplicatesDetected }}</div>
                        </div>
                    </div>

                    <div v-if="results.failedRecords && results.failedRecords.length > 0" class="mt-3 rounded border border-red-100 bg-red-50 p-3">
                        <p class="mb-1 text-xs font-semibold text-red-600">Errors:</p>
                        <ul class="max-h-32 list-disc overflow-y-auto pl-4 text-left text-xs text-red-700">
                            <li v-for="(fail, i) in results.failedRecords" :key="i">
                                {{ fail.message }}
                            </li>
                        </ul>
                    </div>
                </div>

                <div v-if="uploadStatus && !results" class="mt-2 text-sm font-medium text-gray-600">
                    {{ uploadStatus }}
                </div>
            </div>

            <div class="mb-2 flex items-center justify-between">
                <h4 class="text-sm font-semibold text-gray-500 uppercase">Staging Records</h4>
                <button @click="handleCleanupStg" :disabled="isCleaning" class="flex items-center gap-1 rounded bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200 disabled:opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                    </svg>
                    Cleanup Staging
                </button>
            </div>

            <div class="overflow-hidden rounded-md border">
                <ApiDataTable :rows-per-page="3" ref="stagingTable" api-url="/api/transaction/TransactionStgPage">
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
                </ApiDataTable>
            </div>
        </div>
    </DataDialog>
</template>
