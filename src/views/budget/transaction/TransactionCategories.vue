<script setup>
import handleAxiosError from '@/scripts/axios/Error';
import Button from 'primevue/button';
import Card from 'primevue/card';
import { useToast } from 'primevue/usetoast';
import { nextTick, onMounted, ref, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import TransactionService from '@/services/voidapi/budget/transaction/TransactionService';
import debounce from 'lodash-es/debounce';

const toast = useToast();

const initialFilter = {
    Search: null
};
const filter = ref({ ...initialFilter });
const showUnspecifiedLane = ref(false);
const isDraggingMain = ref(false);
const modalBusy = ref(false);
const isLoading = ref(false);
const columns = ref([]);
const savingSubId = ref(null);
const pageTempSearch = ref('');

const getLaneData = async () => {
    isLoading.value = true;
    try {
        const response = await TransactionService.GetCategoryBoard({ params: filter.value });

        const list = response.data?.mainCategories ?? [];
        columns.value = list.map((c) => ({
            ...c,
            subCategories: c.subCategories ?? []
        }));
    } catch (error) {
        console.error('Error fetching lane data:', error);
        handleAxiosError(error, toast);
        throw error;
    } finally {
        isLoading.value = false;
    }
};

const onCategoryUpdate = async (event, column) => {
    await nextTick();

    const subCategoryId = Number(event.item?.dataset?.id);
    if (!subCategoryId) return;

    try {
        savingSubId.value = subCategoryId;

        const updateColumn = {
            subCategoryId,
            mainCategoryId: column.id
        };

        await TransactionService.UpdateSubCategory(updateColumn);
    } catch (error) {
        handleAxiosError(error, toast);
        await pageRefresh();
    } finally {
        savingSubId.value = null;
        toast.add({ severity: 'success', summary: 'Category Updated', life: 3000 });
    }
};

const pageRefresh = async () => {
    await getLaneData();
};

watch(
    filter,
    async () => {
        await pageRefresh();
    },
    { deep: true }
);

const pageSearch = async (data) => {
    if (pageTempSearch.value.length > 2 || pageTempSearch.value.length === 0) filter.value.Search = pageTempSearch.value;
};

const debouncedPageSearch = debounce(pageSearch, 300);

onMounted(async () => {
    await pageRefresh();
});
</script>

<template>
    <!-- Fixed page height so lanes scroll inside -->
    <div class="p-6 text-slate-100" style="height: calc(100vh - 160px); overflow: hidden">
        <div class="mb-8 grid grid-cols-12 gap-8">
            <div class="col-span-12">
                <div class="flex flex-col items-center gap-6 sm:flex-row">
                    <span class="text-4xl font-bold text-slate-100">Transaction Categories</span>
                </div>
            </div>
        </div>

        <div class="flex items-center gap-2 pb-2">
            <InputText v-model="pageTempSearch" placeholder="Search" showClear @input="debouncedPageSearch" />
            <div class="flex-auto"></div>
            <Button @click="pageRefresh()" severity="secondary" class="!-mt-2 flex-none" text rounded v-tooltip.bottom="'Refresh'">
                <i class="pi pi-refresh !text-lg"></i>
            </Button>
        </div>

        <div
            class="relative grid grid-flow-col items-stretch gap-4 overflow-x-auto"
            :style="{
                height: 'calc(100vh - 290px)',
                gridAutoColumns: '20rem',
                gridTemplateColumns: '16rem'
            }"
        >
            <div v-if="isLoading" class="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
                <ProgressSpinner />
            </div>

            <div v-for="column in columns" :key="column.id" class="flex h-full min-h-0 flex-col">
                <!-- Sticky Column Header -->
                <div class="sticky top-0 z-10 mb-3 bg-slate-950">
                    <div class="mb-2 rounded-lg border border-slate-700 bg-slate-900 p-3 pb-1 shadow-sm">
                        <div class="flex justify-between">
                            <div class="min-w-0">
                                <h3 class="truncate text-lg font-semibold text-slate-100" :title="column.name">
                                    <span class="flex items-center gap-2">
                                        <span class="truncate">{{ column.name }}</span>
                                    </span>
                                </h3>
                            </div>
                            <div class="flex flex-col items-end gap-2">
                                <span class="rounded-full bg-slate-700 px-2.5 py-0.5 text-sm font-medium text-slate-100">
                                    {{ column.subCategories?.length ?? 0 }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Draggable Content Area -->
                <div class="lane-dropzone lane-dropzone-main min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900/60 p-4">
                    <VueDraggable
                        v-model="column.subCategories"
                        group="deliveries"
                        class="min-h-full space-y-3"
                        :data-column-id="column.id"
                        ghost-class="lane-drag-ghost"
                        :animation="200"
                        :empty-insert-threshold="100"
                        handle=".cursor-move"
                        :filter="'.no-drag'"
                        :prevent-on-filter="false"
                        :force-fallback="true"
                        :fallback-on-body="true"
                        :scroll-sensitivity="100"
                        :scroll-speed="10"
                        @add="onCategoryUpdate($event, column)"
                    >
                        <div v-for="subCategory in column.subCategories" :key="subCategory.id" :data-id="subCategory.id" class="relative" :style="{ borderRadius: 'var(--p-card-border-radius, 0.5rem)' }">
                            <div v-if="savingSubId === subCategory.id" class="pointer-events-auto absolute inset-0 z-20 grid place-items-center bg-black/50" style="border-radius: inherit">
                                <ProgressSpinner style="width: 18px; height: 18px" strokeWidth="8" />
                            </div>
                            <Card :data-id="subCategory.id" class="prevent-select cursor-move overflow-hidden border border-slate-300 bg-slate-200 shadow-sm transition-shadow duration-200 hover:shadow-md">
                                <template #content>
                                    <div class="relative">
                                        <p class="font-medium text-slate-900">
                                            {{ subCategory.name }}
                                        </p>
                                    </div>
                                </template>
                            </Card>
                        </div>
                    </VueDraggable>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.prevent-select {
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

:deep(.custom-dialog-no-chrome .p-dialog-header),
:deep(.custom-dialog-no-chrome .p-dialog-footer) {
    display: none !important;
}

:deep(.custom-dialog-no-chrome .p-dialog-header-actions),
:deep(.custom-dialog-no-chrome .p-dialog-close-button) {
    display: none !important;
}

:deep(.lane-dropzone-main:has(.lane-drag-ghost)) {
    box-shadow: 0 0 0 1px #8b00fd;
}

/* Hide vertical scrollbar inside lane only */
:deep(.lane-dropzone-main) {
    scrollbar-width: none; /* Firefox */
}

:deep(.lane-dropzone-main::-webkit-scrollbar) {
    width: 0;
    height: 0;
}
</style>
