<script setup>
const props = defineProps({
    busy: {
        type: Boolean,
        required: true
    },
    hideFooter: {
        type: Boolean,
        required: false,
        default: false
    },
    saveBtnAttrs: {
        type: Object,
        default: () => ({})
    }
});
</script>

<template>
    <Dialog modal position="top" class="w-[65vw]" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <slot />
        <div v-if="!hideFooter" class="flex justify-end gap-2 mt-6">
            <Button type="button" label="Cancel" severity="secondary" @click="$emit('closeModal')" :disabled="props.busy"></Button>
            <Button type="button" label="Save" @click="$emit('save')" :disabled="props.busy" :loading="props.busy" v-bind="saveBtnAttrs"></Button>
        </div>
    </Dialog>
</template>

<style scoped></style>
