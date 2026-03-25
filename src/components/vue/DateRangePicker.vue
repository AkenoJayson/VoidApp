<script setup>
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { ref, computed } from 'vue';

const model = defineModel();

const props = defineProps({
    showTime: {
        type: Boolean,
        default: false
    }
});

const componentFormats = ref({
    input: props.showTime ? 'yyyy/MM/dd HH:mm' : 'yyyy/MM/dd'
});

const timeConfig = computed(() => ({
    enableTimePicker: props.showTime
}));
</script>

<template>
    <VueDatePicker v-model="model" :formats="componentFormats" :time-config="timeConfig" :range="{ partialRange: false }" v-bind="$attrs"></VueDatePicker>
</template>
