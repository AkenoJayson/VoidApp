import { updatePreset } from '@primevue/themes';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import 'remixicon/fonts/remixicon.css';

import '@/assets/tailwind.css';
import '@/assets/styles.scss';
import '@/assets/datatable.scss';
import '@/assets/dialog.scss';

import { getPresetExt } from '@/layout/composables/layout';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    },
    locale: {
        dateFormat: 'dd/mm/yy'
    }
});
app.use(ToastService);
app.use(ConfirmationService);
app.use(pinia);

app.mount('#app');

updatePreset(getPresetExt());
