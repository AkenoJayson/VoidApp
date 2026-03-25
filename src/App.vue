<script setup>
import LoadingScreen from './components/vue/LoadingScreen.vue';
import { onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/security/user/AuthStore';
import { emitter } from '@/services/global/eventBus';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

onMounted(() => {
    const authStore = useAuthStore();
    authStore.loadStoredAuth();
    emitter.on('notification', (data) => {
        toast.add({
            severity: 'info',
            summary: data.title,
            detail: data.message,
            life: 5000
        });
    });
});

onUnmounted(() => {
    emitter.off('notification');
});
</script>

<template>
    <LoadingScreen />
    <Toast />
    <router-view />
</template>

<style scoped></style>
