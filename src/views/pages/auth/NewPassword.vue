<script setup>
import AppConfig from '@/layout/AppConfig.vue';
import { useLayout } from '@/layout/composables/layout';
import { useToast } from 'primevue/usetoast';
import { Form } from 'vee-validate';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import * as Yup from 'yup';

const router = useRouter();
const { isDarkTheme } = useLayout();
const toast = useToast();

const modalItem = ref({});

const resetPasswordSchema = Yup.object().shape({
    Password: Yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Password must contain an uppercase letter')
        .matches(/[a-z]/, 'Password must contain a lowercase letter')
        .matches(/[0-9]/, 'Password must contain a number')
        .matches(/[\W_]/, 'Password must contain a special character'),
    ConfirmPassword: Yup.string()
        .oneOf([Yup.ref('Password'), null], 'Passwords must match')
        .required('Please confirm your password')
});

function returnToLogin() {
    router.push({ name: 'login' });
}
</script>

<template>
    <div class="flex min-h-screen items-center justify-center px-8">
        <div class="z-10 rounded border border-surface-200 bg-surface-0 px-6 py-16 md:px-16 dark:border-surface-700 dark:bg-surface-900">
            <div class="mb-6">
                <div class="mb-2 text-xl font-bold text-surface-900 dark:text-surface-0">New Password</div>
                <span class="font-medium text-surface-600 dark:text-surface-200">Enter your new password</span>
            </div>
            <div class="flex flex-col">
                <Form id="resetPasswordForm" :validation-schema="resetPasswordSchema" @submit="resetPasswordClick">
                    <IconField class="w-full">
                        <InputIcon class="pi pi-lock z-20" />
                        <VeePassword
                            id="password1"
                            placeholder="Password"
                            name="Password"
                            v-model="modalItem.Password"
                            class="w-full"
                            :inputStyle="{ paddingLeft: '2.5rem' }"
                            inputClass="w-full md:w-[25rem]"
                            toggleMask
                            @paste.prevent
                            errorMessageTpTarget="#password1ErrorDiv"
                        />
                    </IconField>
                    <div id="password1ErrorDiv"></div>
                    <IconField class="mt-6 w-full">
                        <InputIcon class="pi pi-lock z-20" />
                        <VeePassword
                            id="password2"
                            placeholder="Confirm Password"
                            name="ConfirmPassword"
                            v-model="modalItem.ConfirmPassword"
                            class="w-full"
                            :inputStyle="{ paddingLeft: '2.5rem' }"
                            inputClass="w-full md:w-[25rem]"
                            toggleMask
                            @paste.prevent
                            errorMessageTpTarget="#password2ErrorDiv"
                        />
                    </IconField>
                    <div id="password2ErrorDiv"></div>
                    <div class="mt-6 flex flex-wrap justify-between gap-2">
                        <Button label="Cancel" class="flex-auto" outlined @click="returnToLogin"></Button>
                        <Button label="Submit" class="flex-auto" type="submit" form="resetPasswordForm"></Button>
                    </div>
                </Form>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>
