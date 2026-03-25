<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import AppMenu from './AppMenu.vue';

const { layoutState, onSidebarToggle } = useLayout();

function handleResize() {
    if (window.innerWidth < 768) {
        layoutState.sidebarActive = false;
        layoutState.anchored = false;
    }
}

onMounted(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});

const isSidebarOpen = computed(() => layoutState.anchored || layoutState.sidebarActive);

function onSidebarToggleClick() {
    onSidebarToggle(!isSidebarOpen.value);
}

let closeTimeout = null;

function startCloseTimeout() {
    if (closeTimeout) clearTimeout(closeTimeout);
    closeTimeout = setTimeout(() => {
        onSidebarToggle(false);
        closeTimeout = null;
    }, 500);
}

function cancelCloseTimeout() {
    if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
    }
}
</script>

<template>
    <div class="layout-sidebar" :aria-hidden="!isSidebarOpen" @mouseenter="cancelCloseTimeout" @mouseleave="startCloseTimeout">
        <div class="sidebar-header">
            <router-link :to="{ name: 'Dashboard' }" class="app-logo flex flex-col items-center justify-center py-4" style="height: 3rem">
                <img v-if="isSidebarOpen" src="/src/assets/images/logo.png" alt="Full Logo" class="h-12 w-auto" />
                <img v-else src="/src/assets/images/VoidTech_small.png" alt="Icon Logo" class="ml-4 h-8 w-auto p-0" />
            </router-link>
            <button class="layout-sidebar-toggle z-20 mb-2 flex items-center justify-center" type="button" @click="onSidebarToggleClick" aria-label="Toggle Sidebar">
                <svg v-if="!isSidebarOpen" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
        <div class="layout-menu-container">
            <AppMenu />
        </div>
    </div>
</template>
