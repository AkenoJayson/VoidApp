import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import UserService from '@/services/voidapi/users/UserService';

export const useUserStore = defineStore(
    'user',
    () => {
        const user = ref(null);
        const loaded = ref(false);

        const isLoggedIn = computed(() => !!user.value);

        watch(
            user,
            (val) => {
                if (val) loaded.value = true;
            },
            { immediate: true }
        );

        async function loadCurrentUser() {
            if (loaded.value) return;

            try {
                const response = await UserService.GetUserInfo();
                user.value = response.data;
            } catch (error) {
                user.value = null;
            } finally {
                loaded.value = true;
            }
        }

        function clear() {
            user.value = null;
            loaded.value = false;
        }

        return {
            user,
            isLoggedIn,
            loadCurrentUser,
            clear
        };
    },
    {
        persist: {
            key: 'user-store',
            pick: ['user']
        }
    }
);
