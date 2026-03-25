<script setup>
import { computed, defineEmits, defineModel } from 'vue';

const filter = defineModel('filter', { required: true })

const props = defineProps({
    initialFilter: {
        type: Object,
        required: true
    }
});
const emit = defineEmits();
const isFiltersApplied = computed(() => !Object.keys(props.initialFilter).every((key) => props.initialFilter[key] === filter.value[key]));

const clearFilter = () => {
    filter.value = {...props.initialFilter}
    emit('filterCleared');
};

defineExpose({
    clearFilter
});
</script>

<template>
    <Button v-if="isFiltersApplied" label="Clear Filter" severity="secondary" badgeClass="!bg-[#6c757d] !text-[#fff]" @click="clearFilter" />
</template>

<style scoped></style>
