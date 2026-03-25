<script setup>
import { ref, reactive, onMounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { addDays, format } from 'date-fns';

// VARIABLES
const calendarRef = ref(null);
const headerTitle = ref('');

const todayISO = () => format(new Date(), 'yyyy-MM-dd');

const events = ref([
    { id: '1', title: 'Team Standup', start: todayISO() },
    { id: '2', title: 'Project Planning', start: format(addDays(new Date(), 1), 'yyyy-MM-dd') },
    { id: '3', title: 'Dentist Appointment', start: format(addDays(new Date(), 3), 'yyyy-MM-dd'), allDay: false },
    { id: '4', title: 'Lunch with Sam', start: format(addDays(new Date(), 5), 'yyyy-MM-dd') }
]);

const showDialog = ref(false);
const editingEvent = reactive({ id: null, title: '', start: '', end: '', allDay: true });

// METHODS
const updateEventFromCalendar = (ev) => {
    const idx = events.value.findIndex((e) => e.id === ev.id);
    if (idx !== -1) {
        events.value[idx].start = ev.startStr;
        events.value[idx].end = ev.endStr || null;
    }
};

const goPrev = () => calendarRef.value.getApi().prev();
const goNext = () => calendarRef.value.getApi().next();
const goToday = () => calendarRef.value.getApi().today();
const changeView = (v) => calendarRef.value.getApi().changeView(v);

const openDialogWith = (payload) => {
    Object.assign(editingEvent, payload);
    showDialog.value = true;
};

const openNewEventDialog = () =>
    openDialogWith({
        id: null,
        title: '',
        start: todayISO(),
        end: todayISO(),
        allDay: true
    });

const saveEvent = () => {
    if (!editingEvent.title.trim()) return;

    if (editingEvent.id) {
        const idx = events.value.findIndex((e) => e.id === editingEvent.id);
        if (idx !== -1) events.value[idx] = { ...editingEvent };
    } else {
        const newId = Date.now().toString();
        events.value.push({ id: newId, ...editingEvent });
    }

    calendarOptions.events = [...events.value];
    showDialog.value = false;
};

const deleteEvent = () => {
    if (!editingEvent.id) return;
    const idx = events.value.findIndex((e) => e.id === editingEvent.id);
    if (idx !== -1) events.value.splice(idx, 1);
    calendarOptions.events = [...events.value];
    showDialog.value = false;
};

// CALENDAR OPTIONS
const calendarOptions = reactive({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: false,
    height: '100%',
    dayMaxEvents: true,
    selectable: true,
    editable: true,

    views: {
        dayGridMonth: {
            titleFormat: { year: 'numeric', month: 'long' }
        }
    },

    events: events.value,

    select: (info) =>
        openDialogWith({
            id: null,
            title: '',
            start: info.startStr,
            end: info.endStr,
            allDay: info.allDay
        }),

    eventClick: (info) => {
        const ev = info.event;
        openDialogWith({
            id: ev.id,
            title: ev.title,
            start: ev.startStr,
            end: ev.endStr,
            allDay: ev.allDay
        });
    },

    eventDrop: (info) => updateEventFromCalendar(info.event),
    eventResize: (info) => updateEventFromCalendar(info.event),

    datesSet: (arg) => (headerTitle.value = arg.view.title)
});

onMounted(() => {
    headerTitle.value = calendarRef.value.getApi().view.title;
});
</script>

<template>
    <div class="flex h-[87vh] flex-col bg-surface-900 text-surface-0">
        <!-- TOP BAR -->
        <div class="flex justify-between border-b border-surface-700 bg-surface-800 p-3 px-5">
            <div class="flex gap-2">
                <button class="rounded-md border border-surface-600 bg-surface-700 px-3 py-1.5 text-surface-0" @click="goPrev">‹</button>
                <button class="rounded-md border border-surface-600 bg-surface-700 px-3 py-1.5 text-surface-0" @click="goNext">›</button>
                <button class="rounded-md border border-surface-600 bg-surface-700 px-3 py-1.5 text-surface-0" @click="goToday">Today</button>
            </div>

            <div class="text-xl font-semibold">{{ headerTitle }}</div>

            <div class="flex gap-2">
                <button class="rounded-md border border-surface-600 bg-surface-700 px-3 py-1.5 text-surface-0" @click="changeView('dayGridMonth')">Month</button>
                <button class="rounded-md border border-surface-600 bg-surface-700 px-3 py-1.5 text-surface-0" @click="changeView('timeGridWeek')">Week</button>
                <button class="rounded-md border border-surface-600 bg-surface-700 px-3 py-1.5 text-surface-0" @click="changeView('timeGridDay')">Day</button>
                <button class="rounded-md border border-[#1a73e8] bg-[#1a73e8] px-3 py-1.5 text-white" @click="openNewEventDialog">+ Create</button>
            </div>
        </div>

        <!-- CALENDAR -->
        <div class="flex-1 p-3">
            <FullCalendar ref="calendarRef" :options="calendarOptions" />
        </div>
        <DataDialog v-if="showDialog" open class="w-[400px] rounded-lg bg-surface-800 p-4 text-surface-0">
            <h3 class="mb-3 text-lg font-semibold">{{ editingEvent.id ? 'Edit Event' : 'New Event' }}</h3>

            <label class="mb-1 block">Title</label>
            <input v-model="editingEvent.title" class="mb-3 w-full rounded border border-surface-600 bg-surface-700 p-2 text-surface-0" />

            <label class="mb-1 block">Start</label>
            <input v-model="editingEvent.start" class="mb-3 w-full rounded border border-surface-600 bg-surface-700 p-2 text-surface-0" />

            <label class="mb-1 block">End</label>
            <input v-model="editingEvent.end" class="mb-3 w-full rounded border border-surface-600 bg-surface-700 p-2 text-surface-0" />

            <div class="mt-4 flex items-center justify-between">
                <button v-if="editingEvent.id" @click="deleteEvent" class="text-red-500 hover:text-red-700">Delete</button>
                <div class="flex gap-2">
                    <button @click="showDialog = false" class="rounded border border-surface-600 bg-surface-700 px-3 py-1">Cancel</button>
                    <button @click="saveEvent" class="rounded border border-[#1a73e8] bg-[#1a73e8] px-3 py-1 text-white">Save</button>
                </div>
            </div>
        </DataDialog>
    </div>
</template>

<style scoped>
/* FullCalendar internal styling - must remain CSS */

/* GOOGLE STYLE EVENT PILL */
:global(.fc-event) {
    border-radius: 4px;
    padding: 2px 4px;
    font-size: 0.85rem;
}

/* DAY GRID CELLS LIKE GOOGLE */
:global(.fc-daygrid-day) {
    background: var(--surface-900);
    border: 1px solid var(--surface-700);
}

/* TODAY HIGHLIGHT */
:global(.fc-day-today) {
    background: rgba(26, 115, 232, 0.15) !important;
}

/* SHRINK MONTH-VIEW GRID CELLS */
:global(.fc .fc-daygrid-day) {
    height: 70px !important;
}

:global(.fc .fc-daygrid-day-frame) {
    padding: 2px !important;
}

:global(.fc .fc-daygrid-day-number) {
    font-size: 0.75rem !important;
    padding: 2px !important;
}
</style>
