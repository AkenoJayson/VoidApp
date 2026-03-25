<script setup>
import { ref, onMounted, watch } from 'vue';
import Chart from 'primevue/chart';
import TransactionReportService from '@/services/voidapi/budget/transaction/TransactionReportService';
import { endOfDay, endOfMonth, format, startOfDay, startOfMonth } from 'date-fns';
import { DEFAULTDATEFORMAT } from '@/scripts/constants/DefaultDateFormats';
import DateRangePicker from '@/components/vue/DateRangePicker.vue';
import TransactionService from '@/services/voidapi/budget/transaction/TransactionService';

const isLoading = ref(true);
const now = new Date();
const initialStart = startOfDay(startOfMonth(now));
const initialEnd = endOfDay(endOfMonth(now));
const monthlySpendData = ref();
const avgSpendData = ref();
const monthlySpendOptions = ref();
const avgSpendOptions = ref();
const transactionCategoryOptions = ref([]);

const textColor = '#e5e7eb';
const textColorSecondary = '#9ca3af';
const surfaceBorder = '#374151';

const initialFilter = {
    TransactionMonthString: null,
    CategoryId: null,
    FromDate: format(initialStart, DEFAULTDATEFORMAT),
    ToDate: format(initialEnd, DEFAULTDATEFORMAT),
    dateRange: [initialStart, initialEnd]
};

const filter = ref({ ...initialFilter });

const monthDropdownOptions = [
    { label: 'Current Month', value: null },
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 }
];

const colorPalette = ['#60A5FA', '#F87171', '#34D399', '#FBBF24', '#A78BFA', '#F472B6', '#818CF8', '#2DD4BF', '#FB923C', '#94A3B8'];

//Functions
const GetMonthlySpend = async () => {
    try {
        const [spendRes, incomeRes] = await Promise.all([TransactionReportService.GetMonthlySpend({ params: filter.value }), TransactionReportService.GetMonthlyIncome({ params: filter.value })]);

        const spendData = spendRes.data;
        const incomeData = incomeRes.data;

        const labels = ['Total Income', ...spendData.labels];

        const values = [incomeData.totalIncome, ...spendData.datasets[0].data];

        const backgroundColors = values.map((_, index) => (index === 0 ? '#22C55E' : '#EF4444'));

        monthlySpendData.value = {
            labels,
            datasets: [
                {
                    label: 'Amount',
                    data: values,
                    backgroundColor: backgroundColors,
                    barThickness: 40
                }
            ]
        };

        monthlySpendOptions.value = {
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.raw ?? 0;
                            return `R ${value.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: textColor },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        callback: function (value) {
                            return `R ${value.toLocaleString()}`;
                        }
                    },
                    grid: { color: surfaceBorder }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        };
    } catch (err) {
        console.error('Error loading monthly spend:', err);
    }
};

const GetAverageSpend = async () => {
    try {
        const response = await TransactionReportService.GetSubCategoryTotals({
            params: filter.value
        });

        const { data } = response;

        avgSpendData.value = {
            labels: data.map((x) => x.subCategoryName),
            datasets: [
                {
                    // Amounts
                    data: data.map((x) => x.totalAmount),

                    // 👇 Store parent categories INSIDE dataset
                    parentCategories: data.map((x) => x.parentCategoryName),

                    backgroundColor: colorPalette,
                    hoverBackgroundColor: colorPalette,
                    borderColor: '#1f2937',
                    borderWidth: 2
                }
            ]
        };

        avgSpendOptions.value = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                },

                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw ?? 0;

                            // 👇 Get parent category via index
                            const parent = context.dataset.parentCategories[context.dataIndex] || 'Uncategorised';

                            // Currency format
                            return `${parent} R ${Number(value).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}`;
                        }
                    }
                }
            },

            responsive: true,
            maintainAspectRatio: false
        };
    } catch (err) {
        console.error('Error loading subcategory totals:', err);
    }
};

const GetCategoryDropdown = async () => {
    try {
        const response = await TransactionService.GetCategoryDropdown();
        transactionCategoryOptions.value = response.data;
    } catch (err) {
        console.error('Error loading category dropdown:', err);
    }
};

const GetStoreTrend = async () => {
    var response = await TransactionReportService.GetStoreTrend();
    const storeTrendOptions = response.data;
};

const pageRefresh = async () => {
    await Promise.all([GetMonthlySpend(), GetAverageSpend(), GetCategoryDropdown()]);
};

const initData = async () => {
    isLoading.value = true;
    try {
        await pageRefresh();
    } catch (e) {
        console.error('Error loading charts', e);
    }
    isLoading.value = false;
};

watch(
    () => filter.value.dateRange,
    (newValue) => {
        if (newValue?.[0]) {
            const start = startOfDay(newValue[0]);
            filter.value.FromDate = format(start, DEFAULTDATEFORMAT);
        } else {
            filter.value.FromDate = null;
        }

        if (newValue?.[1]) {
            const end = endOfDay(newValue[1]);
            filter.value.ToDate = `${format(end, DEFAULTDATEFORMAT)}T23:59:59.999`;
        } else {
            filter.value.ToDate = null;
        }
    },
    { deep: true, immediate: true }
);

watch(
    () => filter.value,
    async () => {
        await pageRefresh();
    },
    { deep: true }
);

onMounted(async () => {
    await initData();
});
</script>

<template>
    <div class="p-4">
        <div class="mb-6 flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-100">Budget Analytics</h2>

            <button @click="initData" class="rounded-full bg-indigo-900/50 p-2 text-indigo-300 transition-colors hover:bg-indigo-800 hover:text-white">
                <i class="pi pi-refresh" :class="{ 'animate-spin': isLoading }"></i>
            </button>
        </div>
        <div v-if="isLoading" class="flex h-64 items-center justify-center text-gray-500">
            <span>Loading charts...</span>
        </div>
        <div v-else class="space-y-12">
            <section class="border-t border-gray-700 pt-8">
                <div class="mb-6 flex items-center gap-3">
                    <h3 class="text-lg font-semibold text-gray-200">Total Spent by Category</h3>

                    <DateRangePicker v-model="filter.dateRange" class="w-full max-w-[17rem]" />
                </div>

                <div class="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-sm">
                    <!-- Increased height to fix squish -->
                    <div class="h-[600px] w-full">
                        <Chart type="bar" :data="monthlySpendData" :options="monthlySpendOptions" class="h-full w-full" />
                    </div>
                </div>
            </section>

            <section class="border-t border-gray-700 pt-8">
                <div class="mb-6 flex items-center gap-3">
                    <h3 class="text-lg font-semibold text-gray-200">Total Spent by Subcategory</h3>

                    <DateRangePicker v-model="filter.dateRange" class="w-full max-w-[17rem]" />
                    <div>
                        <Select v-model="filter.CategoryId" showClear filter :options="transactionCategoryOptions" option-label="text" option-value="id" placeholder="Select a category"></Select>
                    </div>
                </div>

                <div class="flex items-center justify-center rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-sm">
                    <div class="flex h-[420px] w-full items-center justify-center">
                        <Chart type="doughnut" :data="avgSpendData" :options="avgSpendOptions" class="h-full w-full max-w-[500px]" />
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>
