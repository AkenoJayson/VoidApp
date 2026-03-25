<script setup>
import handleAxiosError from '@/scripts/axios/Error';
import axiosN from '@/services/axios/axiosVoidApiInstance';
import { useToast } from 'primevue/usetoast';
import { computed, reactive, watchEffect } from 'vue';

const toast = useToast();
const props = defineProps({
    apiUrl: {
        type: String,
        required: true
    },
    filter: {
        type: Object,
        required: false
    },
    rowsPerPage: {
        type: Number,
        required: false,
        default: 10
    }
});

const dtValue = reactive({
    offsetRows: 0,
    isLoading: false,
    totalRows: 0,
    rowsPerPage: props.rowsPerPage,
    rows: null,
    sortBy: null,
    sortDesc: null
});

const apiParams = computed(() => {
    return {
        page: dtValue.offsetRows / dtValue.rowsPerPage + 1,
        rowsPerPage: dtValue.rowsPerPage,
        sortBy: dtValue.sortBy,
        sortDesc: dtValue.sortDesc == 1
    };
});

const getDtData = async (params) => {
    dtValue.isLoading = true;
    if (props.filter != null) Object.assign(params, props.filter);
    try {
        var response;

        response = await axiosN.get(props.apiUrl, {
            params: params
        });

        dtValue.totalRows = response.data.totalRows;
        dtValue.rows = response.data.rows;
        dtValue.isLoading = false;
    } catch (error) {
        dtValue.isLoading = false;
        handleAxiosError(error, toast);
    }
};
const refresh = () => {
    getDtData(apiParams.value);
};

watchEffect(() => {
    getDtData(apiParams.value);
});

defineExpose({
    refresh,
    dtValue
});
</script>

<template>
    <DataTable
        :value="dtValue.rows"
        :paginator="true"
        v-model:first="dtValue.offsetRows"
        v-model:rows="dtValue.rowsPerPage"
        v-model:sort-field="dtValue.sortBy"
        v-model:sort-order="dtValue.sortDesc"
        :lazy="true"
        :loading="dtValue.isLoading"
        :row-hover="true"
        :total-records="dtValue.totalRows"
        :rows-per-page-options="[3, 5, 10, 20, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="{first}-{last} of {totalRecords} results"
    >
        <slot />
    </DataTable>
</template>
<style scoped></style>
