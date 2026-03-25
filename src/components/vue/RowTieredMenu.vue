<script setup>
import { ref } from 'vue';

const props = defineProps({
    model: {
        type: Array,
        default: () => []
    },
    anchorSelector: {
        type: String,
        default: '.p-button,button,[role="button"]'
    }
});

const menu = ref(null);
const items = ref(props.model);

function open(evt, newItems) {
    if (newItems) items.value = newItems;

    const e = evt?.originalEvent ?? evt;
    const anchor = e?.currentTarget ?? e?.target?.closest?.(props.anchorSelector) ?? e?.target;

    const inst = menu.value;
    if (!inst || !anchor) return;

    inst.target = anchor;

    if (inst.overlayVisible) {
        if (typeof inst.alignOverlay === 'function') {
            inst.alignOverlay();
        } else {
            inst.hide();
            requestAnimationFrame(() => inst.show({ originalEvent: e, currentTarget: anchor, target: anchor }));
        }
    } else {
        inst.show({ originalEvent: e, currentTarget: anchor, target: anchor });
    }
}

function setItems(newItems) {
    items.value = Array.isArray(newItems) ? newItems : [];
}

defineExpose({ open, setItems });
</script>

<template>
    <TieredMenu ref="menu" :model="items" popup />
</template>

<style scoped></style>
