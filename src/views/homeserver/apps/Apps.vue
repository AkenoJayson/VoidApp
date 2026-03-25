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
import { DEFAULT_DATETIME_FORMAT } from '@/scripts/constants/DefaultDateFormats';
import WebAppsService from '@/services/voidapi/webapps/WebAppsService';

//Variables
const toast = useToast();
const webappsDtGearMenu = ref();
const webappsApiDt = ref();
const webappsAddEditModalVisible = ref(false);
const webappsDtFilterDrawerVisible = ref(false);
const totalRowsBadgeInfo = computed(() => String(webappsApiDt.value?.dtValue.totalRows ?? 'NA'));
const modalTitle = ref('');
const modalItemDefault = ref({
    Name: '',
    Url: '',
    Status: true
});
const modalItem = ref();
const webappsDtGearMenuItems = ref();
const modalBusy = ref(false);
const pageTempSearch = ref('');
const initialFilter = {
    search: null,
    statusId: null
};
const filter = ref({ ...initialFilter });

const modifyWebappsSchema = Yup.object().shape({
    Name: Yup.string().required().min(3),
    Url: Yup.string().required().min(3)
});

const openModal = (title, item) => {
    //this part resets the modal item. this could maybe rather happen on modal save/close event
    modalItem.value = { ...modalItemDefault.value };
    if (item) {
        modalItem.value = { ...item };
    }
    modalTitle.value = title;
    webappsAddEditModalVisible.value = true;
};

const onRowAction = (rowData, event) => {
    // Define your menu items with row data
    webappsDtGearMenuItems.value = [{ label: 'Edit', icon: 'pi pi-pencil', command: () => openModal('Edit Web App', rowData) }];

    // Show the TieredMenu
    webappsDtGearMenu.value.toggle(event);
};

const save = async () => {
    modalBusy.value = true;
    try {
        await WebAppsService.Save(modalItem.value);
        toast.add({ severity: 'success', detail: 'Saved!', life: 3000, position: 'middle' });
        webappsApiDt.value.refresh();
        closeModal();
    } catch (e) {
        handleAxiosError(e, toast);
    } finally {
        modalBusy.value = false;
    }
};

const pageRefresh = async () => {
    webappsApiDt.value.refresh();
};

const closeModal = () => {
    webappsAddEditModalVisible.value = false;
    pageRefresh();
};

const pageSearch = async (data) => {
    if (pageTempSearch.value.length > 2 || pageTempSearch.value.length === 0) filter.value.search = pageTempSearch.value;
};

const debouncedPageSearch = debounce(pageSearch, 300);

onMounted(async () => {
    // await getStatusOptions();
    // await getSiteOptions();
    // await getAssignedUserOptions();
    // modalItem.value = modalItemDefault;
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
                        <Button type="button" label="Rows" :badge="totalRowsBadgeInfo" severity="secondary" />
                    </div>
                    <ClearFilterButton v-model:filter="filter" :initialFilter="initialFilter" class="ml-2" @filterCleared="pageTempSearch = ''" />
                    <Button @click="webappsDtFilterDrawerVisible = !webappsDtFilterDrawerVisible" severity="secondary" class="!-mt-2 flex-none" text rounded><i class="pi pi-filter !text-lg"></i></Button>
                    <Button @click="pageRefresh()" severity="secondary" class="!-mt-2 flex-none" text rounded><i class="pi pi-refresh !text-lg"></i></Button>
                    <Button @click="openModal('Create Department', null)" severity="secondary" class="!-mt-2 flex-none" text rounded><i class="pi pi-plus !text-lg"></i></Button>
                </div>
                <ApiDataTable ref="webappsApiDt" api-url="Api/Homeserver/Page" :filter="filter">
                    <!-- <Column field="Id" header="Id" sortable></Column> -->
                    <Column field="name" header="Site Name" sortable></Column>
                    <Column field="url" header="URL" sortable>
                        <template #body="slotProps">
                            <a :href="slotProps.data.url" target="_blank" rel="noopener noreferrer" class="break-all text-purple-500 hover:underline">
                                {{ slotProps.data.url }}
                            </a>
                        </template>
                    </Column>
                    <Column field="lastPing" header="Last Ping" sortable>
                        <template #body="slotProps">
                            {{ format(slotProps.data.lastPing, DEFAULT_DATETIME_FORMAT) }}
                        </template>
                    </Column>
                    <Column field="status" header="Status" sortable headerStyle="width: 5rem; text-align: center">
                        <template #body="slotProps">
                            <div class="flex items-center justify-center">
                                <i :class="['pi', slotProps.data.status ? 'pi-circle-fill text-green-500' : 'pi-circle-fill text-red-500']"></i>
                            </div>
                        </template>
                    </Column>
                    <Column headerStyle="width: 5rem; text-align: center" bodyStyle="text-align: center; overflow: visible">
                        <template #body="slotProps">
                            <Button @click="onRowAction(slotProps.data, $event)" severity="secondary" text rounded><i class="pi pi-cog !text-lg"></i></Button>
                        </template>
                    </Column>
                </ApiDataTable>
            </div>
        </div>
    </div>

    <TieredMenu ref="webappsDtGearMenu" :model="webappsDtGearMenuItems" popup />
    <DataDialog v-model:visible="webappsAddEditModalVisible" :header="modalTitle" :busy="modalBusy" @close-modal="closeModal" :style="{ width: '500px' }" :save-btn-attrs="{ type: 'submit', form: 'webappsModifyModalForm' }">
        <Form id="webappsModifyModalForm" :validation-schema="modifyWebappsSchema" @submit="save">
            <div class="mb-4 flex flex-wrap">
                <div class="flex grow flex-col gap-2">
                    <label for="Name">Name</label>
                    <VeeInputText v-model="modalItem.name" id="Name" name="Name" />
                </div>
            </div>
            <div class="mb-4 flex flex-wrap">
                <div class="flex grow flex-col gap-2">
                    <label for="url">Url</label>
                    <VeeInputText v-model="modalItem.url" id="url" name="Url" />
                </div>
            </div>
        </Form>
    </DataDialog>

    <Drawer v-model:visible="departmentDtFilterDrawerVisible" header="Filters" position="right" :modal="false">
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
