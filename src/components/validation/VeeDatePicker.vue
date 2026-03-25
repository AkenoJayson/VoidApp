<script setup>
import { useField } from 'vee-validate';
import { computed, toRef } from 'vue';
import { DEFAULT_DATETIME_FORMAT, PRIMEVUE_DATE_PICKER_FORMAT } from '@/scripts/constants/DefaultDateFormats';

const props = defineProps({
    modelValue: {
        default: undefined
    },
    name: {
        type: String,
        required: true
    },
    rules: {
        type: String,
        default: undefined
    },
    errorMessageTpTarget: {
        type: String
    }
});

const name = toRef(props, 'name');
const {
    value: inputValue,
    errorMessage,
    meta
} = useField(name, props.rules, {
    initialValue: props.modelValue
});
const isInvalid = computed(() => (meta.touched || meta.dirty) && !meta.valid);
</script>

<template>
    <DatePicker v-model="inputValue" :dateFormat="PRIMEVUE_DATE_PICKER_FORMAT" v-bind="$attrs" :invalid="isInvalid" />
    <Teleport v-if="errorMessage" :disabled="!props.errorMessageTpTarget" :to="props.errorMessageTpTarget">
        <div class="text-red-600" v-if="errorMessage">
            {{ errorMessage }}
        </div>
    </Teleport>
</template>

<style scoped></style>
