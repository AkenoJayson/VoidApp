<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';
import UserProfileService from '@/services/voidapi/users/UserProfileService';
import { useAuthStore } from '@/stores/security/user/AuthStore';

const profileImage = ref();
const authStore = useAuthStore();
const userName = ref('');
const { getPrimary, getSurface, isDarkTheme } = useLayout();
const price = ref(0);
const chartData = ref(null);
const chartOptions = ref(null);
const payments = ref([
    { name: 'Electric Bill', amount: 75.6, paid: true, date: '06/04/2022' },
    { name: 'Water Bill', amount: 45.5, paid: true, date: '07/04/2022' },
    { name: 'Gas Bill', amount: 45.2, paid: false, date: '12/04/2022' },
    { name: 'Internet Bill', amount: 25.9, paid: true, date: '17/04/2022' },
    { name: 'Streaming', amount: 40.9, paid: false, date: '20/04/2022' }
]);

onMounted(() => {
    initChart();
});

function initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    chartData.value = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'Income',
                data: [6500, 5900, 8000, 8100, 5600, 5500, 4000],
                fill: false,
                tension: 0.4,
                borderColor: documentStyle.getPropertyValue('--p-green-500')
            },
            {
                label: 'Expenses',
                data: [1200, 5100, 6200, 3300, 2100, 6200, 4500],
                fill: true,
                borderColor: '#6366f1',
                tension: 0.4,
                backgroundColor: 'rgba(99,102,220,0.2)'
            }
        ]
    };

    chartOptions.value = {
        animation: {
            duration: 0
        },
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';

                        if (label) {
                            label += ': ';
                        }

                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };
}

function formatCurrency(value) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

watch(
    [getPrimary, getSurface, isDarkTheme],
    () => {
        initChart();
    },
    { immediate: true }
);

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
    <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12">
            <div class="flex flex-col items-center gap-6 sm:flex-row">
                <div class="flex flex-col items-center gap-4 sm:flex-row">
                    <img alt="avatar" :src="profileImage" class="h-16 w-16 flex-shrink-0" />
                    <div class="flex flex-col items-center sm:items-start">
                        <span class="text-4xl font-bold">Welcome {{ userName }}</span>
                    </div>
                </div>
                <div class="flex gap-2 sm:ml-auto">
                    <Button type="button" v-tooltip.bottom="'Exchange'" icon="pi pi-arrows-h" outlined rounded></Button>
                    <Button type="button" v-tooltip.bottom="'Withdraw'" icon="pi pi-download" outlined rounded></Button>
                    <Button type="button" v-tooltip.bottom="'Send'" icon="pi pi-send" rounded></Button>
                </div>
            </div>
        </div>
        <div class="col-span-12 md:col-span-6 xl:col-span-4">
            <div class="card relative h-full overflow-hidden">
                <!-- SVG background -->
                <svg class="absolute left-0 top-0 h-full w-full" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#000000" />
                            <stop offset="100%" stop-color="#0d47a1" />
                        </linearGradient>
                        <radialGradient id="highlight" cx="70%" cy="30%" r="80%">
                            <stop offset="0%" stop-color="rgba(255,255,255,0.15)" />
                            <stop offset="100%" stop-color="rgba(255,255,255,0)" />
                        </radialGradient>
                    </defs>

                    <rect x="0" y="0" width="900" height="600" rx="40" ry="40" fill="url(#cardGradient)" />
                    <rect x="0" y="0" width="900" height="600" rx="40" ry="40" fill="url(#highlight)" />
                </svg>

                <!-- Text content -->
                <div class="relative z-10 flex h-full flex-col justify-between p-6 text-white">
                    <div>
                        <div class="mb-4 text-xl font-semibold">Debit Card</div>
                        <div class="mb-1 font-semibold">Balance</div>
                        <div class="mb-8 text-2xl font-bold">TODO</div>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-lg">**** **** **** 5998</span>
                        <span class="text-lg font-medium">07/31</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-span-12 md:col-span-6 xl:col-span-4">
            <div class="card relative h-full overflow-hidden">
                <!-- SVG background -->
                <svg class="absolute left-0 top-0 h-full w-full" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="cardGradientRed" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#000000" />
                            <stop offset="100%" stop-color="#b71c1c" />
                        </linearGradient>
                        <radialGradient id="highlightRed" cx="70%" cy="30%" r="80%">
                            <stop offset="0%" stop-color="rgba(255,255,255,0.15)" />
                            <stop offset="100%" stop-color="rgba(255,255,255,0)" />
                        </radialGradient>
                    </defs>

                    <rect x="0" y="0" width="900" height="600" rx="40" ry="40" fill="url(#cardGradientRed)" />
                    <rect x="0" y="0" width="900" height="600" rx="40" ry="40" fill="url(#highlightRed)" />
                </svg>

                <!-- Text content -->
                <div class="relative z-10 flex h-full flex-col justify-between p-6 text-white">
                    <div class="mb-4 flex items-center justify-between">
                        <div class="text-xl font-semibold">Credit Card</div>
                    </div>
                    <div class="mb-1 font-semibold">Debt</div>
                    <div class="mb-8 text-2xl font-bold">TODO</div>
                    <div class="flex items-center justify-between">
                        <span class="text-lg">**** **** **** 1072</span>
                        <span class="text-lg font-medium">10/31</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-span-12 md:col-span-6 xl:col-span-2">
            <div class="card flex h-full flex-col items-center justify-center">
                <i class="pi pi-dollar mb-6 !text-4xl text-primary"></i>
                <span class="mb-6 text-lg font-medium text-surface-900 dark:text-surface-0">Primary</span>
                <span class="text-2xl font-bold text-primary">$24,345.21</span>
            </div>
        </div>
        <div class="col-span-12 md:col-span-6 xl:col-span-2">
            <div class="card flex h-full flex-col items-center justify-center">
                <i class="pi pi-euro mb-6 !text-4xl text-primary"></i>
                <span class="mb-6 text-lg font-medium text-surface-900 dark:text-surface-0">Currency</span>
                <span class="text-2xl font-bold text-primary">$10,416.11</span>
            </div>
        </div>

        <div class="col-span-12 xl:col-span-4">
            <div class="card">
                <div class="mb-4 text-xl font-semibold text-surface-900 dark:text-surface-0">Recent Transactions</div>
                <ul class="m-0 list-none p-0">
                    <li class="mb-4 flex items-center border-b border-surface-200 p-4 dark:border-surface-700">
                        <!-- <img alt="brands" src="/demo/images/banking/airbnb.png" class="mr-4 w-12 flex-shrink-0" /> -->
                        <div class="flex flex-col">
                            <span class="mb-1 text-xl font-medium text-surface-900 dark:text-surface-0">Airbnb</span>
                            <span>05/23/2022</span>
                        </div>
                        <span class="ml-auto text-xl font-semibold text-surface-900 dark:text-surface-0">$250.00</span>
                    </li>
                    <li class="mb-4 flex items-center border-b border-surface-200 p-4 dark:border-surface-700">
                        <!-- <img alt="brands" src="/demo/images/banking/amazon.png" class="mr-4 w-12 flex-shrink-0" /> -->
                        <div class="flex flex-col">
                            <span class="mb-1 text-xl font-medium text-surface-900 dark:text-surface-0">Amazon</span>
                            <span>04/12/2022</span>
                        </div>
                        <span class="ml-auto text-xl font-semibold text-surface-900 dark:text-surface-0">$50.00</span>
                    </li>
                    <li class="mb-4 flex items-center border-b border-surface-200 p-4 dark:border-surface-700">
                        <!-- <img alt="brands" src="/demo/images/banking/nike.svg" class="mr-4 w-12 flex-shrink-0 rounded-full" /> -->
                        <div class="flex flex-col">
                            <span class="mb-1 text-xl font-medium text-surface-900 dark:text-surface-0">Nike Store</span>
                            <span>04/29/2022</span>
                        </div>
                        <span class="ml-auto text-xl font-semibold text-surface-900 dark:text-surface-0">$60.00</span>
                    </li>
                    <li class="mb-4 flex items-center border-b border-surface-200 p-4 dark:border-surface-700">
                        <!-- <img alt="brands" src="/demo/images/banking/starbucks.svg" class="mr-4 w-12 flex-shrink-0" /> -->
                        <div class="flex flex-col">
                            <span class="mb-1 text-xl font-medium text-surface-900 dark:text-surface-0">Starbucks</span>
                            <span>04/15/2022</span>
                        </div>
                        <span class="ml-auto text-xl font-semibold text-surface-900 dark:text-surface-0">$15.24</span>
                    </li>
                    <li class="mb-4 flex items-center p-4">
                        <!-- <img alt="brands" src="/demo/images/banking/amazon.png" class="mr-4 w-12 flex-shrink-0" /> -->
                        <div class="flex flex-col">
                            <span class="mb-1 text-xl font-medium text-surface-900 dark:text-surface-0">Amazon</span>
                            <span>04/12/2022</span>
                        </div>
                        <span class="ml-auto text-xl font-semibold text-surface-900 dark:text-surface-0">$12.50</span>
                    </li>
                </ul>
            </div>
        </div>
        <div class="col-span-12 xl:col-span-8">
            <div class="card h-full">
                <div class="mb-4 text-xl font-semibold text-surface-900 dark:text-surface-0">Overview</div>
                <Chart type="line" :data="chartData" :options="chartOptions"></Chart>
            </div>
        </div>

        <div class="col-span-12 lg:col-span-6">
            <div class="card h-full">
                <div class="mb-4 flex items-center justify-between">
                    <div class="text-xl font-semibold text-surface-900 dark:text-surface-0">Recent Transactions</div>
                    <Button type="button" icon="pi pi-plus" label="Add New" size="small" outlined></Button>
                </div>
                <div class="flex flex-col gap-y-4">
                    <div class="flex flex-col gap-4 lg:flex-row">
                        <div class="border-radius flex w-full cursor-pointer items-center rounded border border-surface-200 p-4 hover:bg-surface-100 lg:w-6/12 dark:border-surface-700 dark:hover:bg-surface-700">
                            <!-- <img alt="avatar" src="/demo/images/avatar/circle/avatar-f-1.png" class="mr-2 w-8 flex-shrink-0" /> -->
                            <span class="text-lg font-medium text-surface-900 dark:text-surface-0">Aisha Williams</span>
                        </div>
                        <div class="border-radius flex w-full cursor-pointer items-center rounded border border-surface-200 p-4 hover:bg-surface-100 lg:w-6/12 dark:border-surface-700 dark:hover:bg-surface-700">
                            <!-- <img alt="avatar" src="/demo/images/avatar/circle/avatar-f-2.png" class="mr-2 w-8 flex-shrink-0" /> -->
                            <span class="text-lg font-medium text-surface-900 dark:text-surface-0">Jane Watson</span>
                        </div>
                    </div>
                    <div class="flex flex-col gap-4 lg:flex-row">
                        <div class="border-radius flex w-full cursor-pointer items-center rounded border border-surface-200 p-4 hover:bg-surface-100 lg:w-6/12 dark:border-surface-700 dark:hover:bg-surface-700">
                            <!-- <img alt="avatar" src="/demo/images/avatar/circle/avatar-m-1.png" class="mr-2 w-8 flex-shrink-0" /> -->
                            <span class="text-lg font-medium text-surface-900 dark:text-surface-0">Brad Curry</span>
                        </div>
                        <div class="border-radius flex w-full cursor-pointer items-center rounded border border-surface-200 p-4 hover:bg-surface-100 lg:w-6/12 dark:border-surface-700 dark:hover:bg-surface-700">
                            <!-- <img alt="avatar" src="/demo/images/avatar/circle/avatar-f-3.png" class="mr-2 w-8 flex-shrink-0" /> -->
                            <span class="text-lg font-medium text-surface-900 dark:text-surface-0">Claire Dunphy</span>
                        </div>
                    </div>
                    <div class="flex flex-col gap-4 lg:flex-row">
                        <div class="border-radius flex w-full cursor-pointer items-center rounded border border-surface-200 p-4 hover:bg-surface-100 lg:w-6/12 dark:border-surface-700 dark:hover:bg-surface-700">
                            <!-- <img alt="avatar" src="/demo/images/avatar/circle/avatar-m-2.png" class="mr-2 w-8 flex-shrink-0" /> -->
                            <span class="text-lg font-medium text-surface-900 dark:text-surface-0">Kevin James</span>
                        </div>
                        <div class="flex w-full cursor-pointer items-center rounded border border-surface-200 p-4 hover:bg-surface-100 lg:w-6/12 dark:border-surface-700 dark:hover:bg-surface-700">
                            <!-- <img alt="avatar" src="/demo/images/avatar/circle/avatar-f-4.png" class="mr-2 w-8 flex-shrink-0" /> -->
                            <span class="text-lg font-medium text-surface-900 dark:text-surface-0">Sarah McTamish</span>
                        </div>
                    </div>
                </div>

                <div class="mt-8 flex flex-col gap-4 sm:flex-row">
                    <InputNumber type="text" :value="price" mode="currency" currency="USD" locale="en-US" fluid></InputNumber>
                    <Button type="button" label="Send"></Button>
                </div>
            </div>
        </div>

        <div class="col-span-12 lg:col-span-6">
            <div class="card">
                <div class="mb-4 text-xl font-semibold text-surface-900 dark:text-surface-0">Monthly Payments</div>

                <DataTable ref="dt" :value="payments" dataKey="id" :rows="5">
                    <template #empty> No products found.</template>
                    <Column field="name" header="Name" class="w-4/12 whitespace-nowrap"> </Column>
                    <Column field="price" header="Amount" class="w-4/12 whitespace-nowrap">
                        <template #body="{ data }">
                            {{ formatCurrency(data.amount) }}
                        </template>
                    </Column>
                    <Column field="date" header="Date" class="w-4/12 whitespace-nowrap"> </Column>
                    <Column field="inventoryStatus" header="Status" class="w-4/12 whitespace-nowrap text-right">
                        <template #body="{ data }">
                            <Tag v-if="data.paid" value="COMPLETED" severity="success"></Tag>
                            <Tag v-else value="PENDING" severity="warn"></Tag>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
