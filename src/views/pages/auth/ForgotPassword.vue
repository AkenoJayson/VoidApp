<script setup>
import AppConfig from '@/layout/AppConfig.vue';
import { useRouter } from 'vue-router';
import handleAxiosError from '@/scripts/axios/Error';
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { Form } from 'vee-validate';
import * as Yup from 'yup';

const router = useRouter();
const toast = useToast();

const forgotPasswordSchema = Yup.object().shape({
    Email: Yup.string().email().required()
});

function returnToLogin() {
    router.push({ name: 'login' });
}

//set v-model of input to this variable and call function on button to send email
const emailInput = ref('');
</script>

<template>
    <div class="flex min-h-screen items-center justify-center px-8">
        <div class="z-10 rounded border border-surface-200 bg-surface-0 px-6 py-16 md:px-16 dark:border-surface-700 dark:bg-surface-900">
            <div class="mb-6">
                <div class="mb-2 text-xl font-bold text-surface-900 dark:text-surface-0">Forgot Password</div>
                <span class="font-medium text-surface-600 dark:text-surface-200">Enter your email to reset your password</span>
            </div>
            <div class="flex flex-col">
                <Form id="forgotPasswordForm" :validation-schema="forgotPasswordSchema" @submit="sendForgotPasswordClick">
                    <IconField class="w-full">
                        <InputIcon class="pi pi-envelope" />
                        <VeeInputText id="email" v-model="emailInput" type="text" class="w-full md:w-[25rem]" placeholder="Email" name="Email" errorMessageTpTarget="#emailErrorDiv" />
                    </IconField>
                    <div id="emailErrorDiv"></div>
                    <div class="mt-6 flex flex-wrap justify-between gap-2">
                        <Button label="Cancel" class="flex-auto" outlined @click="returnToLogin"></Button>
                        <Button label="Submit" class="flex-auto" type="submit" form="forgotPasswordForm"></Button>
                    </div>
                </Form>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>
