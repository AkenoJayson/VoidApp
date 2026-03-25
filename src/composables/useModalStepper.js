import { computed, ref } from 'vue';

export function useModalStepper(selectedItem, selectedStoreId, formData) {
    const currentStep = ref(1);

    const modalTitle = computed(() => {
        if (currentStep.value === 1) return 'What do you need?';
        if (currentStep.value === 2) return selectedItem.value?.descr || 'Where will you buy this?';
        return 'Quick details';
    });

    const canProceed = computed(() => {
        if (currentStep.value === 1) return !!selectedItem.value;
        if (currentStep.value === 2) return !!selectedStoreId.value;
        return formData.quantity > 0 && formData.price >= 0 && !!selectedStoreId.value;
    });

    return {
        currentStep,
        modalTitle,
        canProceed
    };
}
