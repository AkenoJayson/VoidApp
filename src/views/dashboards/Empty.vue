<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { verifyLogin } from '@/services/axios/axiosVoidApiInstance';
import JiraIntegrationService from '@/services/voidapi/jira/JiraIntegrationService';
import handleAxiosError from '@/scripts/axios/Error';
import GoogleCalendarService from '@/services/voidapi/google/calendar/GoogleCalendarService';
import EventCard from '@/components/eventCard/EventCard.vue';
import { useAuthStore } from '@/stores/security/user/AuthStore';

const toast = useToast();
const modalBusy = ref(false);
const jiraTasks = ref([]);
const googleCalendarEvents = ref([]);
const upcomingEvents = ref([]);
const dateRangeDays = ref(15); // default 15 days
const includeCompleted = ref(false);
const calendarStatusOptions = ref([]);
const jiraStatusOptions = ref([]);
const dateRangeOptions = [
    { label: '7 days', value: 7 },
    { label: '15 days', value: 15 },
    { label: '30 days', value: 30 }
];

// Jira root URL for CTA
const jiraRootUrl = 'https://voidtech.atlassian.net/browse';

const GetGoogleCalendarStatusDropdown = async () => {
    modalBusy.value = true;
    try {
        const response = await GoogleCalendarService.GetGoogleCalendarStatusDropdown();
        calendarStatusOptions.value = response.data;
    } catch (e) {
        handleAxiosError(e, toast);
    }
};

const GetJiraStatusDropdown = async (search = '') => {
    modalBusy.value = true;
    try {
        const response = await JiraIntegrationService.GetJiraStatusDropdown();
        jiraStatusOptions.value = response.data;
    } catch (e) {
        handleAxiosError(e, toast);
    }
};

const getJiraTasks = async (search = '') => {
    modalBusy.value = true;
    try {
        const response = await JiraIntegrationService.page({ params: { search } });
        jiraTasks.value = response.data;
    } catch (e) {
        handleAxiosError(e, toast);
    }
};

const GetUpcomingEvents = async () => {
    modalBusy.value = true;
    try {
        const response = await GoogleCalendarService.GetUpcomingEvents({
            userId: useAuthStore().userId,
            dateRangeDays: dateRangeDays.value,
            includeCompleted: includeCompleted.value
        });

        googleCalendarEvents.value = response.data.calendarEvents || [];
        jiraTasks.value = response.data.jiraEvents || [];

        // Merge both into upcomingEvents
        upcomingEvents.value = [...googleCalendarEvents.value, ...jiraTasks.value];
    } catch (e) {
        handleAxiosError(e, toast);
    } finally {
        modalBusy.value = false;
    }
};

watch([dateRangeDays, includeCompleted], () => {
    GetUpcomingEvents();
});

// initial load
onMounted(async () => {
    Promise.all([verifyLogin(), getJiraTasks(), GetUpcomingEvents(), GetGoogleCalendarStatusDropdown(), GetJiraStatusDropdown()]);
});
</script>

<template>
    <div class="mb-6 flex flex-col gap-6">
        <div class="flex w-full gap-6">
            <div class="w-3/4 rounded-xl border border-gray-700 bg-gray-900 p-4 shadow-lg transition-opacity duration-300">
                <div class="mb-3 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <h2 class="text-xl font-semibold text-white">Upcoming Events</h2>
                        <select v-model="dateRangeDays" class="rounded bg-gray-800 px-2 py-1 text-sm text-white">
                            <option v-for="opt in dateRangeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                        </select>
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="checkbox" v-model="includeCompleted" id="completedToggle" class="rounded text-purple-500" />
                        <label for="completedToggle" class="text-sm text-white">Include Completed</label>
                    </div>
                </div>
                <div class="scrollbar-hide max-h-[calc(3*90px+2rem)] space-y-4 overflow-y-auto pr-2">
                    <EventCard v-for="task in upcomingEvents" :key="task.id" :task="task" :calendar-status-options="calendarStatusOptions" :jira-status-options="jiraStatusOptions" class="hover:z-10" />
                </div>
            </div>
            <div class="w-1/4 rounded-xl border border-gray-700 bg-gray-900 p-4 shadow-lg">
                <h2 class="mb-2 text-xl font-semibold text-white">Knowledge</h2>
                <p class="text-sm text-gray-400">📚 Quick access to docs, notes, and guides.</p>
            </div>
        </div>
        <div class="rounded-xl border border-gray-700 bg-gray-900 p-4 shadow-lg lg:col-span-3">
            <h2 class="mb-2 text-xl font-semibold text-white">Monitoring</h2>
            <p class="text-sm text-gray-400">✅ All systems operational. Uptime: 99.98%</p>
            <div class="flex h-40 items-center justify-center text-gray-500">[Mini chart here]</div>
        </div>

        <div class="rounded-xl border border-gray-700 bg-gray-900 p-4 shadow-lg">
            <h2 class="mb-2 text-xl font-semibold text-white">Media</h2>
            <p class="text-sm text-gray-400">🎵 Now Playing: LoFi Beats</p>
            <div class="mt-2 h-2 rounded-full bg-gray-700">
                <div class="h-2 w-2/3 rounded-full bg-purple-500"></div>
            </div>
        </div>

        <div class="rounded-xl border border-gray-700 bg-gray-900 p-4 shadow-lg">
            <h2 class="mb-2 text-xl font-semibold text-white">Automation</h2>
            <p class="text-sm text-gray-400">⚙️ 4 active automation rules.</p>
        </div>

        <div class="rounded-xl border border-gray-700 bg-gray-900 p-4 shadow-lg">
            <h2 class="mb-2 text-xl font-semibold text-white">Realtime</h2>
            <p class="text-sm text-gray-400">📡 Live updates flowing...</p>
        </div>

        <div class="rounded-xl border border-gray-700 bg-gray-900 p-4 shadow-lg">
            <h2 class="mb-2 text-xl font-semibold text-white">Storage</h2>
            <p class="text-sm text-gray-400">💾 Used: 480 GB / 1 TB</p>
            <div class="mt-2 h-2 rounded-full bg-gray-700">
                <div class="h-2 w-1/2 rounded-full bg-green-500"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Hide scrollbars but keep scroll functionality */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
}
</style>
