import { defineStore } from 'pinia';
import AuthServiceV from '@/services/voidapi/security/AuthService';
import AuthServiceYt from '@/services/ytdpl/auth/AuthService';
import { useCentrifugoStore } from '@/stores/centrifuge/centrifugoStore';
import { requestNotificationPermission } from '@/services/firebase/FirebaseService';
import NotificationService from '@/services/voidapi/notification/NotificationService';
import { useUserStore } from '@/stores/security/user/UserStore';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: null,
        userId: null,
        username: null,
        isLoggedIn: false
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        getToken: (state) => state.token,
        getUserId: (state) => state.userId,
        getUsername: (state) => state.username
    },

    actions: {
        async voidLogin(credentials) {
            const response = await AuthServiceV.Login(credentials);
            const { token, expires } = response.data;

            this.token = token;
            this.isLoggedIn = true;

            await this.storeAuthData(token, expires);

            return response;
        },

        async storeAuthData(token, expires) {
            const centrifugoStore = useCentrifugoStore();
            const userStore = useUserStore();

            const authData = {
                token,
                expires,
                timestamp: Date.now()
            };

            localStorage.setItem('auth_data', JSON.stringify(authData));
            localStorage.setItem('auth_token', token);

            try {
                await userStore.loadCurrentUser();
            } catch (error) {}

            try {
                await centrifugoStore.connect();
            } catch (error) {}

            try {
                const fcmToken = await requestNotificationPermission();
                if (fcmToken) {
                    await NotificationService.Register(fcmToken);
                }
            } catch (error) {}
        },

        async ytLogin(credentials) {
            const response = await AuthServiceYt.Login(credentials);
            const { data } = response;

            this.data = data;
            this.isLoggedIn = true;

            await this.storeYtdlpAuthData(data);

            return response;
        },

        async storeYtdlpAuthData(data) {
            const authData = {
                data,
                timestamp: Date.now()
            };

            localStorage.setItem('ytdlp_auth_data', JSON.stringify(authData));
            localStorage.setItem('yt-dlp', data);
        },

        async loadStoredAuth() {
            try {
                const rawData = localStorage.getItem('auth_data');

                if (!rawData) return false;

                const { token, expires } = JSON.parse(rawData);

                if (!this.isTokenValid(expires)) {
                    await this.clearAuth();
                    return false;
                }

                this.token = token;
                this.isLoggedIn = true;

                return true;
            } catch (error) {
                return false;
            }
        },

        async loadStoredYtdlpAuth() {
            try {
                const rawData = localStorage.getItem('ytdlp_auth_data');

                if (!rawData) return false;

                const { data } = JSON.parse(rawData);

                this.data = data;

                return data;
            } catch (error) {
                return false;
            }
        },

        async logout() {
            const centrifugoStore = useCentrifugoStore();

            localStorage.removeItem('auth_data');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('ytdlp_auth_data');
            localStorage.removeItem('yt-dlp');

            centrifugoStore.disconnect();

            this.token = null;
            this.isLoggedIn = false;

            window.location.href = '/';
        },

        isTokenValid(expires) {
            if (!expires) return true;
            const expirationDate = new Date(expires);
            return expirationDate > new Date();
        },

        async clearAuth() {
            localStorage.removeItem('auth_data');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('ytdlp_auth_data');
            localStorage.removeItem('yt-dlp');

            this.token = null;
            this.isLoggedIn = false;
        },

        async CheckYtdlpAuth() {
            const rawData = localStorage.getItem('ytdlp_auth_data');
            if (!rawData) return false;

            try {
                const auth = JSON.parse(rawData);
                return !!auth.data;
            } catch (e) {
                return false;
            }
        }
    }
});
