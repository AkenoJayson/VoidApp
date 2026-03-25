<script setup>
import { computed, toRefs, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import GoogleCalendarService from '@/services/voidapi/google/calendar/GoogleCalendarService';

const props = defineProps({
    task: Object,
    calendarStatusOptions: Array,
    jiraStatusOptions: Array
});

const toast = useToast();

const { task, calendarStatusOptions, jiraStatusOptions } = toRefs(props);

// Choose correct list based on source
const options = computed(() => (task.value.source === 'Calendar' ? calendarStatusOptions.value : jiraStatusOptions.value));

// Pick color for selected status
const statusColor = computed(() => {
    const found = options.value.find((o) => o.text.toLowerCase() === task.value.status?.toLowerCase());
    return found ? found.color : 'bg-gray-500 text-white';
});

// --- NEW: Function to update the event ---
const updateEventStatus = async () => {
    try {
        const model = {
            Id: task.value.id,
            Source: task.value.source,
            Status: task.value.status
        };
        await GoogleCalendarService.UpdateEvent(model);
        toast.add({ severity: 'success', summary: 'Updated', detail: 'Event status updated.', life: 3000 });
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update event status.', life: 3000 });
        console.error(e);
    }
};

// --- Watch the dropdown ---
watch(
    () => task.value.status,
    (newVal, oldVal) => {
        if (newVal !== oldVal) {
            updateEventStatus();
        }
    }
);
</script>

<template>
    <div class="hover:scale-102 flex flex-col rounded-lg border border-gray-700 bg-gray-800 p-3 transition-transform duration-150 hover:z-10 hover:shadow-lg">
        <div class="mb-1 flex items-start justify-between">
            <span class="mr-2 text-xs text-gray-400">{{ task.source }}</span>

            <a v-if="task.url" :href="task.url" target="_blank" rel="noopener" class="text-sm font-semibold text-purple-300 hover:underline"> {{ task.issueKey ? task.issueKey + ' — ' : '' }}{{ task.summary }} </a>
            <span v-else class="text-sm font-semibold text-white">{{ task.summary }}</span>

            <select v-model="task.status" class="ml-2 rounded px-2 py-0.5 text-xs font-semibold" :class="statusColor">
                <option v-for="opt in options" :key="opt.id" :value="opt.text" :class="opt.color">
                    {{ opt.text }}
                </option>
            </select>
        </div>

        <!-- Display dates -->
        <p v-if="task.dueDate" class="mt-1 text-xs text-gray-400">
            📅 Due: <time :datetime="task.dueDate">{{ new Date(task.dueDate).toLocaleDateString() }}</time>
        </p>
        <p v-else-if="task.start" class="mt-1 text-xs text-gray-400">
            📅 Starts: <time :datetime="task.start">{{ new Date(task.start).toLocaleDateString() }}</time>
            <span v-if="task.source === 'Calendar' && task.end">
                — Ends: <time :datetime="task.end">{{ new Date(task.end).toLocaleDateString() }}</time></span
            >
        </p>

        <p v-if="task.assignee" class="text-xs text-gray-400">👤 {{ task.assignee }}</p>
    </div>
</template>
