import { ref } from 'vue';
import FileService from '../business/FileService';
import { useAuthStore } from '@/stores/security/user/AuthStore';

const userProfileImage = ref(null);
const allUserProfileImages = ref([]);

const UserProfileService = {
    async loadUserProfileImage() {
        const authStore = useAuthStore();
        const userId = authStore.userId;

        if (!userId) {
            userProfileImage.value = null;
            return;
        }

        try {
            const response = await FileService.GetProfileImage(userId);
            if (Array.isArray(response.data) && response.data.length > 0) {
                userProfileImage.value = response.data[0].imageBase64;
            } else {
                userProfileImage.value = null;
            }
        } catch (error) {
            console.error('Failed to load user profile image:', error);
            userProfileImage.value = null;
        }
        return null;
    },

    getUserProfileImage() {
        return userProfileImage;
    },

    async loadAllProfileImages() {
        try {
            const response = await FileService.GetAllProfileImages();
            if (Array.isArray(response.data)) {
                allUserProfileImages.value = response.data;
            } else {
                allUserProfileImages.value = [];
            }
        } catch (error) {
            console.error('Failed to load all profile images:', error);
            allUserProfileImages.value = [];
        }
        return [];
    },

    getAllUserProfileImages() {
        return allUserProfileImages;
    }
};

export default UserProfileService;
