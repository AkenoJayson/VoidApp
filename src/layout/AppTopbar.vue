<script setup>
import { onMounted, ref, watch } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import FileService from '@/services/voidapi/business/FileService';
import handleAxiosError from '@/scripts/axios/Error';
import { useAuthStore } from '@/stores/security/user/AuthStore';
import UserProfileService from '@/services/voidapi/users/UserProfileService';
import { useToast } from 'primevue/usetoast';
import AppBreadcrumb from '@/layout/AppBreadcrumb.vue';

const { onMenuToggle, onProfileSidebarToggle } = useLayout();
const toast = useToast();
const authStore = useAuthStore();
const profileImage = ref();
const showMobileMenu = ref(false);

function toggleMobileMenu() {
    showMobileMenu.value = !showMobileMenu.value;
}

function showProfileSidebar() {
    onProfileSidebarToggle();
}

onMounted(async () => {
    await UserProfileService.loadUserProfileImage();

    profileImage.value = formatBase64Image(UserProfileService.getUserProfileImage().value);

    watch(UserProfileService.getUserProfileImage(), (newVal) => {
        profileImage.value = formatBase64Image(newVal);
    });
});

function formatBase64Image(base64String) {
    if (!base64String) return null;
    return `data:image/jpeg;base64,${base64String}`;
}
</script>

<template>
    <div class="layout-topbar">
        <div class="topbar-start"></div>
        <div class="topbar-end">
            <ul class="topbar-menu">
                <AppBreadcrumb class="topbar-breadcrumb"></AppBreadcrumb>
                <li class="topbar-bell">
                    <button type="button" @click="showNotifications" aria-label="Notifications">
                        <i class="pi pi-bell"></i>
                    </button>
                </li>

                <li class="topbar-profile">
                    <button type="button" class="topbar-sidebarbutton" @click="showProfileSidebar" aria-label="Profile">
                        <img :src="profileImage" alt="Profile" class="cursor-pointer rounded-full border-2 border-white shadow" />
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>

<style lang="scss" scoped>
/* Glassmorphism background for topbar */
.layout-topbar {
    position: relative;
    z-index: 100; /* Above background but below modals */
    background: #2a2a40;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: #2a2a40;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

/* Dark theme support */
:global(.layout-dark) .layout-topbar {
    background: #2a2a40;
    border-bottom: 1px solid #2a2a40;
}

/* Slide-in animation for mobile menu */
.slide-menu-enter-active,
.slide-menu-leave-active {
    transition: transform 0.3s cubic-bezier(0, 0, 0.2, 1);
}
.slide-menu-enter-from,
.slide-menu-leave-to {
    transform: translateX(-100%);
}
.slide-menu-enter-to,
.slide-menu-leave-from {
    transform: translateX(0);
}
</style>
