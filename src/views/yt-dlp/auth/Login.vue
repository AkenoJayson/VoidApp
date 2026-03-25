<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { Form } from 'vee-validate';
import VeeInputText from '@/components/validation/VeeInputText.vue';
import VeePassword from '@/components/validation/VeePassword.vue';
import * as Yup from 'yup';
import ProgressSpinner from 'primevue/progressspinner';
import { useAuthStore } from '@/stores/security/user/AuthStore';

const AuthServiceYtdlp = useAuthStore();
const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const isLoading = ref(false);
const toast = useToast();
const router = useRouter();

// Validation schema
const loginSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required')
});

// Login function
const login = async () => {
    try {
        isLoading.value = true;

        const response = await AuthServiceYtdlp.ytLogin({
            Username: username.value,
            Password: password.value
        });
        toast.add({ severity: 'success', detail: 'Login Successful!', life: 3000 });
        router.push({ name: 'YTMainScreen' });
    } catch (e) {
        console.error('Login failed:', e);
        toast.add({ severity: 'error', detail: 'Login failed', life: 4000 });
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div class="relative w-full max-w-md rounded-xl bg-gray-800 p-8 shadow-lg">
            <transition name="fade">
                <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-black/40">
                    <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" fill="transparent" />
                </div>
            </transition>

            <h1 class="mb-6 text-center text-2xl font-bold">YT-DLP Login</h1>

            <Form :validation-schema="loginSchema" @submit="login" class="space-y-4">
                <div>
                    <label for="email" class="mb-2 block text-sm font-medium text-white/80">Username</label>
                    <IconField class="w-full">
                        <InputIcon class="pi pi-user" />
                        <VeeInputText
                            v-model="username"
                            id="username"
                            type="text"
                            name="username"
                            placeholder="Username"
                            class="w-full"
                            errorMessageTpTarget="#usernameErrorDiv"
                            :inputStyle="{ paddingLeft: '2.5rem' }"
                            inputClass="w-full rounded-xl border border-white/20 bg-transparent text-white placeholder-white/40 focus:border-white/40 focus:ring-2 focus:ring-white/30 transition"
                        />
                    </IconField>
                    <div id="usernameErrorDiv" class="mt-1 text-sm text-red-400" role="alert" aria-live="polite"></div>
                </div>

                <div>
                    <div class="mb-2 flex items-center justify-between">
                        <label for="password1" class="block text-sm font-medium text-white/80">Password</label>
                    </div>
                    <IconField class="w-full">
                        <InputIcon class="pi pi-lock z-20" />
                        <VeePassword
                            id="password1"
                            name="password"
                            v-model="password"
                            placeholder="Password"
                            class="w-full"
                            :inputStyle="{ paddingLeft: '2.5rem' }"
                            inputClass="w-full rounded-xl border border-white/20 bg-transparent text-white placeholder-white/40 focus:border-white/40 focus:ring-2 focus:ring-white/30 transition"
                            :feedback="false"
                            toggleMask
                            @paste.prevent
                            errorMessageTpTarget="#password1ErrorDiv"
                        />
                    </IconField>
                    <div id="password1ErrorDiv" class="mt-1 text-sm text-red-400" role="alert" aria-live="polite"></div>
                </div>

                <button type="submit" class="w-full rounded-lg bg-purple-700 p-2 font-semibold hover:bg-purple-800">Login</button>
            </Form>
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
