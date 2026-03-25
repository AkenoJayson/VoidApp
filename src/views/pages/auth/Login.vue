<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { Form } from 'vee-validate';
import VeeInputText from '@/components/validation/VeeInputText.vue';
import VeePassword from '@/components/validation/VeePassword.vue';
import * as Yup from 'yup';
import { useAuthStore } from '@/stores/security/user/AuthStore';
import handleAxiosError from '@/scripts/axios/Error';
import { verifyLogin } from '@/services/axios/axiosVoidApiInstance';
import ProgressSpinner from 'primevue/progressspinner';

const Username = ref('');
const Password = ref('');
const rememberMe = ref(false);
const toast = useToast();
const router = useRouter();
const route = useRoute();
const AuthService = useAuthStore();
const isLoading = ref(false);

const loginSchema = Yup.object().shape({
    Username: Yup.string().required(),
    Password: Yup.string().required('Password is required').min(8, 'Password must be at least 8 characters')
});

const login = async () => {
    try {
        isLoading.value = true;
        const credentials = {
            Email: Username.value,
            Password: Password.value
        };

        const response = await AuthService.voidLogin(credentials, rememberMe.value);

        toast.add({ severity: 'success', detail: 'Login Successful!', life: 3000, position: 'middle' });
        router.push({ name: 'Dashboard' });
    } catch (e) {
        console.error('Login failed:', e);
        handleAxiosError(e, toast);
    } finally {
        isLoading.value = false;
    }
};

const navigateToForgotPassword = () => {
    router.push({ name: 'forgotpassword' });
};

const sendLogin = async () => {
    await login();
};

onMounted(async () => {
    const loggedIn = await verifyLogin();
    if (loggedIn) {
        router.push({ name: 'Dashboard' });
    }
});
</script>

<template>
    <div class="relative min-h-screen w-full overflow-hidden bg-[#0b0b12] text-white" style="background-image: url('/layout/images/bg_logo.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat">
        <div class="absolute inset-0 bg-gradient-to-br from-black/70 via-[#1c1630]/70 to-black/60 backdrop-blur-sm"></div>

        <div class="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
            <div class="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl md:grid-cols-2">
                <div class="relative hidden flex-col bg-gradient-to-br from-white/5 to-white/0 p-10 md:flex">
                    <div class="mb-6">
                        <img src="/layout/images/logo.png" alt="VoidTech Logo" class="h-16 w-auto object-contain" />
                    </div>
                    <div class="flex flex-1 items-center">
                        <div class="text-left">
                            <h2 class="text-2xl font-bold tracking-tight text-white">Welcome to VoidTech Portal</h2>
                            <p class="mt-2 max-w-sm leading-relaxed text-white/70">Secure access to your dashboard, reports, and tools — all in one place.</p>
                        </div>
                    </div>
                    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(132,94,247,0.15),transparent_70%)]"></div>
                </div>
                <div class="relative flex items-center justify-center p-6 sm:p-10">
                    <transition name="fade">
                        <div v-if="isLoading" class="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <ProgressSpinner style="width: 60px; height: 60px" strokeWidth="4" fill="transparent" animationDuration=".8s" />
                        </div>
                    </transition>
                    <div class="w-full" :class="{ 'pointer-events-none opacity-40': isLoading }">
                        <div class="mb-8">
                            <h1 class="text-3xl font-bold tracking-tight text-white">Log in</h1>
                            <p class="mt-2 text-sm text-white/60">Please enter your details to continue.</p>
                        </div>

                        <Form id="loginForm" :validation-schema="loginSchema" @submit="sendLogin" class="space-y-6">
                            <div>
                                <label for="email" class="mb-2 block text-sm font-medium text-white/80">Username</label>
                                <IconField class="w-full">
                                    <InputIcon class="pi pi-envelope" />
                                    <VeeInputText
                                        v-model="Username"
                                        id="email"
                                        type="text"
                                        name="Username"
                                        placeholder="Username"
                                        class="w-full"
                                        errorMessageTpTarget="#emailErrorDiv"
                                        :inputStyle="{ paddingLeft: '2.5rem' }"
                                        inputClass="w-full rounded-xl border border-white/20 bg-transparent text-white placeholder-white/40 focus:border-white/40 focus:ring-2 focus:ring-white/30 transition"
                                    />
                                </IconField>
                                <div id="emailErrorDiv" class="mt-1 text-sm text-red-400" role="alert" aria-live="polite"></div>
                            </div>

                            <div>
                                <div class="mb-2 flex items-center justify-between">
                                    <label for="password1" class="block text-sm font-medium text-white/80">Password</label>
                                    <a class="cursor-pointer text-sm font-medium text-[#8e44ad] hover:text-white" @click="navigateToForgotPassword">Forgot password?</a>
                                </div>
                                <IconField class="w-full">
                                    <InputIcon class="pi pi-lock z-20" />
                                    <VeePassword
                                        id="password1"
                                        name="Password"
                                        v-model="Password"
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

                            <div>
                                <label class="inline-flex select-none items-center gap-2">
                                    <Checkbox name="checkbox" v-model="rememberMe" binary />
                                    <span class="text-sm text-white/80">Remember me</span>
                                </label>
                            </div>

                            <div>
                                <Button label="Log In" class="pv-login-btn w-full rounded-xl border-0 px-6 py-3 font-semibold text-white shadow-lg transition hover:opacity-90" type="submit" form="loginForm" :disabled="isLoading" />
                            </div>

                            <div class="mt-6 text-center text-sm text-white/40">
                                <span>© 2025 VoidTech Portal</span>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
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

:deep(.p-inputtext),
:deep(.p-inputtext.p-filled),
:deep(.p-password .p-inputtext),
:deep(.p-password-input),
:deep(input.p-inputtext),
:deep(.p-inputtext:focus),
:deep(.p-password-input:focus) {
    background: transparent !important;
    color: #ffffff !important;
    border-color: rgba(255, 255, 255, 0.12) !important;
    box-shadow: none !important;
}
.pv-login-btn {
    background-color: #2a2a40 !important;
    border: none !important;
    box-shadow: 0 6px 18px rgba(42, 42, 64, 0.25) !important;
}
.pv-login-btn:hover {
    background-color: #333349 !important;
}
</style>
