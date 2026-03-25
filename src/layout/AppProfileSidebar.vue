<script setup>
import { useLayout } from '@/layout/composables/layout';
import handleAxiosError from '@/scripts/axios/Error';
import { onMounted, ref, watch } from 'vue';
import FileService from '@/services/voidapi/business/FileService';
import UserProfileService from '@/services/voidapi/users/UserProfileService';
import { useAuthStore } from '@/stores/security/user/AuthStore';
import { useToast } from 'primevue/usetoast';

const userName = ref('');
const { layoutState } = useLayout();
const apiVersion = ref('');
const userCompanyOptions = ref([]);
const toast = useToast();
const authStore = useAuthStore();
const profileImage = ref(null);
const fileInput = ref(null);

const triggerImageUpload = () => {
    fileInput.value?.click();
};

const onFileSelected = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', authStore.userId);
    try {
        const response = await FileService.UploadProfileImage(formData);
        profileImage.value = `/uploads/images/${response.data.imageUrl}`;
        toast.add({ severity: 'success', summary: 'Success', detail: 'Profile image updated.' });
        await UserProfileService.loadUserProfileImage();
    } catch (e) {
        handleAxiosError(e, toast);
    }
};

const signOutClickEvt = async (evt) => {
    await authStore.logout();
};

onMounted(async () => {
    userName.value = authStore.username;
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
    <Drawer v-model:visible="layoutState.profileSidebarVisible" position="right" class="layout-profile-sidebar w-full sm:w-[25rem]">
        <div class="mx-auto flex flex-col md:mx-0">
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileSelected" />
            <img :src="profileImage" alt="Profile Image" class="my-4 h-16 w-16 cursor-pointer rounded-full border-2 border-white shadow" @click="triggerImageUpload" />
            <span class="mb-2 font-medium text-surface-500 dark:text-surface-400">{{ userName }}</span>

            <ul class="m-0 list-none p-0">
                <li>
                    <a class="mb-4 flex cursor-pointer items-center rounded border border-surface-200 p-4 transition-colors duration-150">
                        <span>
                            <i class="pi pi-user text-xl text-primary"></i>
                        </span>
                        <div class="ml-4">
                            <span class="mb-2 font-semibold">Profile</span>
                            <p class="m-0 text-surface-500 dark:text-surface-400">User Profile</p>
                        </div>
                    </a>
                </li>
                <li>
                    <a @click="signOutClickEvt" class="mb-4 flex cursor-pointer items-center rounded border border-surface-200 p-4 transition-colors duration-150">
                        <span>
                            <i class="pi pi-power-off text-xl text-primary"></i>
                        </span>
                        <div class="ml-4">
                            <span class="mb-2 font-semibold">Sign Out</span>
                            <p class="m-0 text-surface-500 dark:text-surface-400">Sign Out User</p>
                        </div>
                    </a>
                </li>
                <li>
                    <p>&copy; {{ apiVersion }}</p>
                </li>
            </ul>
        </div>
    </Drawer>
</template>
