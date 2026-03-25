<script setup>
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/stores/security/user/UserStore';
import NotificationService from '@/services/voidapi/notification/NotificationService';
import { useToast } from 'primevue/usetoast';
import { format } from 'date-fns';
import { DEFAULT_DATETIME_FORMAT } from '@/scripts/constants/DefaultDateFormats';
import { useRouter } from 'vue-router';
import { useNavigationStore } from '@/stores/navigation/navigationStore';
import { useWeatherStore } from '@/stores/weather/weatherStore';
import TaskManagementService from '@/services/voidapi/taskManagement/TaskManagementService';
import DataDialog from '@/components/vue/DataDialog.vue';
const userStore = useUserStore();
const weatherStore = useWeatherStore();
const toast = useToast();
const currentTime = ref('');
const messagePanel = ref(null);
const selectedMessage = ref('');
const activityLogLoading = ref(false);
const taskLoading = ref(false);
const router = useRouter();
const navigationStore = useNavigationStore();
const taskInput = ref(null);
const newTask = ref('');
const tasks = ref([]);
const activityLog = ref([]);
const statusOptions = ref([]);
const projectOptions = ref([]);
const editTaskModalVisible = ref(false);
const summary = ref({ toDo: 0, inProgress: 0, completed: 0 });
const modalTitle = ref('');
const modalItem = ref({});

const priorityClass = (priority) => {
    if (priority === 1) return 'text-emerald-400';
    if (priority === 2) return 'text-orange-400';
    if (priority === 3) return 'text-red-400';
    return 'text-white/30';
};

const priorityOptions = [
    { id: 1, text: 'Low' },
    { id: 2, text: 'Medium' },
    { id: 3, text: 'High' }
];

const updateTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};

const showMessage = (event, message) => {
    selectedMessage.value = message;
    messagePanel.value.toggle(event);
};

const getActivityLog = async () => {
    try {
        activityLogLoading.value = true;
        var response = await NotificationService.GetActivityLog();
        activityLog.value = response.data;
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch activity log.', life: 3000 });
    } finally {
        activityLogLoading.value = false;
    }
};

const getStatusOptions = async () => {
    try {
        var response = await TaskManagementService.GetStatusDropdown();
        statusOptions.value = response.data;
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch status options.', life: 3000 });
    }
};

const getSummary = async () => {
    try {
        const response = await TaskManagementService.GetTaskSummary();
        summary.value = response.data;
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch task summary.', life: 3000 });
    }
};

const getTasks = async () => {
    try {
        taskLoading.value = true;
        var response = await TaskManagementService.GetTasks();
        tasks.value = response.data;
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch tasks.', life: 3000 });
    } finally {
        taskLoading.value = false;
    }
};

const getProjects = async () => {
    try {
        const response = await ProjectService.GetProjects();
        projectOptions.value = response.data;
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch projects.' });
    }
};

const openEditTaskModal = (title, item) => {
    modalItem.value = { ...item };
    modalTitle.value = title;
    editTaskModalVisible.value = true;
};

const closeModal = () => {
    editTaskModalVisible.value = false;
};

const saveTask = async (model) => {
    try {
        taskLoading.value = true;
        await TaskManagementService.SaveVoidTask(model);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Task saved successfully.', life: 3000 });
        newTask.value = '';
        taskInput.value?.focus();
        await getTasks();
        await getSummary();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save task.', life: 3000 });
    } finally {
        taskLoading.value = false;
    }
};

const getSeverityColor = (severity) => {
    switch (severity) {
        case 1:
            return 'bg-blue-400';
        case 2:
            return 'bg-emerald-400';
        case 3:
            return 'bg-red-400';
        default:
            return 'bg-gray-400';
    }
};

onMounted(async () => {
    weatherStore.fetchWeather();
    taskInput.value?.focus();
    updateTime();
    setInterval(updateTime, 1000);
    await Promise.all([getActivityLog(), getTasks(), getSummary(), getStatusOptions()]);
});
</script>

<template>
    <!-- ───────────────────────────────────────────────────────── -->
    <!-- MOBILE LAYOUT                                             -->
    <!-- ───────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-4 p-4 font-sans text-white lg:hidden">
        <div class="relative overflow-hidden rounded-2xl border border-purple-900/60 bg-slate-900/55 p-6 backdrop-blur-md">
            <div class="mb-4">
                <h1 class="mt-1 text-2xl font-bold tracking-tight">Welcome {{ userStore.user?.username }}</h1>
            </div>
            <div class="flex items-center gap-4">
                <div class="flex flex-1 flex-col items-center rounded-xl bg-white/5 py-3">
                    <span class="text-xl font-bold">{{ summary.toDo }}</span>
                    <span class="mt-1 text-[8px] tracking-widest text-white/40 uppercase">To Do</span>
                </div>
                <div class="flex flex-1 flex-col items-center rounded-xl bg-white/5 py-3">
                    <span class="text-xl font-bold">{{ summary.inProgress }}</span>
                    <span class="mt-1 text-[8px] tracking-widest text-white/40 uppercase">In Progress</span>
                </div>
                <div class="flex flex-1 flex-col items-center rounded-xl bg-white/5 py-3">
                    <span class="text-xl font-bold">{{ summary.completed }}</span>
                    <span class="mt-1 text-[8px] tracking-widest text-white/40 uppercase">Completed</span>
                </div>
            </div>
        </div>
        <div class="flex gap-4">
            <div class="flex flex-1 flex-col justify-center rounded-2xl border border-white/10 bg-slate-900/55 p-5 backdrop-blur-md">
                <span class="mb-1 text-[10px] tracking-[0.3em] text-white/40 uppercase">Time</span>
                <div class="text-3xl font-black tracking-tighter tabular-nums">{{ currentTime }}</div>
            </div>
            <div class="flex flex-1 flex-col justify-center rounded-2xl border border-white/10 bg-slate-900/55 p-5 backdrop-blur-md">
                <span class="mb-1 text-[10px] tracking-[0.2em] text-white/40 uppercase">Weather</span>
                <div v-if="weatherStore.loading" class="text-xs text-white/40">Fetching...</div>
                <div v-else-if="weatherStore.error" class="text-xs text-white/40">{{ weatherStore.error }}</div>
                <div class="flex flex-col gap-0.5">
                    <div class="text-2xl font-bold">{{ weatherStore.display.temperature }}</div>
                    <div class="truncate text-xs text-white/50">{{ weatherStore.display.condition }}</div>
                    <div class="truncate text-xs text-white/30">{{ weatherStore.display.city }}</div>
                </div>
            </div>
        </div>
        <div class="rounded-2xl border border-white/10 bg-slate-900/55 p-5 backdrop-blur-md">
            <h3 class="mb-4 text-base font-semibold">Recent Pages</h3>
            <div class="flex flex-col gap-2">
                <template v-if="navigationStore.topVisited.length">
                    <button
                        v-for="item in navigationStore.topVisited"
                        :key="item.path"
                        class="group flex w-full items-center justify-between rounded-xl border border-white/5 bg-[#2a2a40] px-4 py-3 text-left text-xs font-bold transition-all active:bg-white/10"
                        @click="router.push(item.path)"
                    >
                        {{ item.name }}
                        <span class="text-white/30">→</span>
                    </button>
                </template>
                <div v-else class="py-4 text-center text-xs text-white/20">No pages visited yet</div>
            </div>
        </div>
    </div>

    <!-- ───────────────────────────────────────────────────────── -->
    <!-- DESKTOP LAYOUT                                            -->
    <!-- ───────────────────────────────────────────────────────── -->
    <div class="hidden p-8 font-sans text-white lg:block lg:p-12">
        <div class="mx-auto grid max-w-[1600px] grid-cols-1 gap-8 lg:grid-cols-12">
            <div class="flex h-[700px] flex-col rounded-[2rem] border border-white/10 bg-slate-900/55 py-8 pr-10 pl-12 backdrop-blur-md lg:col-span-3">
                <div class="mb-8 flex items-center justify-between">
                    <h3 class="text-lg font-semibold">Activity Feed</h3>
                    <Button icon="pi pi-refresh" text rounded class="!h-8 !w-8 !text-gray-400" v-tooltip.top="'Refresh'" @click="getActivityLog" />
                </div>
                <div class="no-scrollbar flex-1 space-y-8 overflow-y-auto pr-2 pl-2">
                    <div v-if="activityLogLoading" class="flex justify-center">
                        <ProgressSpinner class="!h-10 !w-10 text-gray-500" />
                    </div>
                    <div v-if="activityLog.length === 0">
                        <div class="flex h-full items-center justify-center text-sm text-white/20">No recent activity</div>
                    </div>
                    <div v-else v-for="item in activityLog" :key="item.id" class="relative border-l border-white/10 pb-1 pl-8">
                        <div :class="['absolute top-1.5 -left-[6px] h-[11px] w-[11px] rounded-full shadow-[0_0_12px_currentColor]', getSeverityColor(item.severity)]"></div>
                        <p class="mb-2 truncate text-sm leading-relaxed text-white/50">{{ item.message }}</p>
                        <div class="flex items-center justify-between text-[10px] tracking-tight text-white/30">
                            <div>
                                {{ format(item.dateCreated, DEFAULT_DATETIME_FORMAT) }}
                                <span class="mx-1">•</span>
                                {{ item.user }}
                            </div>
                            <i class="pi pi-info-circle cursor-pointer text-white/40 transition-colors hover:text-white" @click="showMessage($event, item.message)" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid h-[700px] grid-cols-3 grid-rows-[2fr_3fr] gap-8 lg:col-span-9">
                <div class="group relative col-span-2 flex flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-purple-900/60 bg-slate-900/55 p-10 shadow-2xl backdrop-blur-md">
                    <div class="flex flex-col items-center text-center">
                        <h1 class="mb-2 text-5xl font-bold tracking-tight">Welcome, {{ userStore.user?.username }}</h1>
                        <div class="mt-6 flex items-center gap-6">
                            <div class="flex flex-col items-center gap-1">
                                <span class="text-2xl font-bold text-white">{{ summary.toDo }}</span>
                                <span class="text-[10px] tracking-widest text-white/40 uppercase">To Do</span>
                            </div>
                            <div class="h-8 w-px bg-white/10"></div>
                            <div class="flex flex-col items-center gap-1">
                                <span class="text-2xl font-bold text-white">{{ summary.inProgress }}</span>
                                <span class="text-[10px] tracking-widest text-white/40 uppercase">In Progress</span>
                            </div>
                            <div class="h-8 w-px bg-white/10"></div>
                            <div class="flex flex-col items-center gap-1">
                                <span class="text-2xl font-bold">{{ summary.completed }}</span>
                                <span class="text-[10px] tracking-widest text-white/40 uppercase">Completed</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-slate-900/55 p-10 shadow-xl backdrop-blur-md">
                    <div>
                        <span class="mb-2 block text-[10px] tracking-[0.3em] text-white/40 uppercase">Time</span>
                        <div class="text-5xl font-black tracking-tighter tabular-nums">{{ currentTime }}</div>
                    </div>
                    <div class="border-t border-white/10 pt-8">
                        <span class="mb-2 block text-[10px] tracking-[0.2em] text-white/40 uppercase">Weather</span>
                        <div v-if="weatherStore.loading" class="text-xs text-white/40">Fetching weather...</div>
                        <div v-else-if="weatherStore.error" class="text-xs text-white/40">{{ weatherStore.error }}</div>
                        <div v-else class="flex items-center gap-4">
                            <div class="text-4xl font-bold">{{ weatherStore.display.temperature }}</div>
                            <div class="text-xs leading-tight text-white/50">
                                {{ weatherStore.display.condition }}<br />
                                {{ weatherStore.display.city }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-span-2 flex min-h-0 flex-col rounded-[2rem] border border-white/10 bg-slate-900/55 p-10 shadow-xl backdrop-blur-md">
                    <div class="mb-8">
                        <h3 class="text-xl font-semibold">Void Tasks</h3>
                    </div>
                    <div class="mb-6 flex items-center border-b border-white/10 pb-3">
                        <input
                            ref="taskInput"
                            v-model="newTask"
                            @keydown.enter="saveTask({ id: 0, title: newTask })"
                            placeholder="Add a task..."
                            class="w-full bg-transparent text-sm text-white transition-colors duration-200 outline-none placeholder:text-white/20"
                        />
                        <button v-if="newTask.trim()" @click="saveTask({ id: 0, title: newTask })" class="ml-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/5 text-white/60 transition-all hover:bg-white/20">+</button>
                    </div>
                    <div class="no-scrollbar flex-1 space-y-4 overflow-y-auto">
                        <div v-for="task in tasks" :key="task.taskId" class="group flex items-center justify-between rounded-2xl border border-white/5 bg-[#2a2a40] px-5 py-4 transition-colors hover:border-indigo-500/40">
                            <div class="min-w-0 flex-1">
                                <span class="block truncate text-sm font-medium">{{ task.title }}</span>
                                <span v-if="task.dueDate" class="text-[10px] text-white/30">Due {{ format(task.dueDate, DEFAULT_DATETIME_FORMAT) }}</span>
                            </div>
                            <span :class="['ml-4 flex-shrink-0 text-[10px] font-black tracking-tighter uppercase', priorityClass(task.priority)]">
                                {{ task.priorityDesc }}
                            </span>
                            <Select v-model="task.statusId" class="ml-4 rounded-lg border" :options="statusOptions" optionLabel="text" optionValue="id" @update:modelValue="(val) => saveTask({ id: task.taskId, title: task.title, statusId: val })" />
                            <button class="ml-3 flex-shrink-0 text-white/20 transition-colors hover:text-white/60" @click="openEditTaskModal(`Edit Task`, task)">
                                <i class="pi pi-cog text-xs" />
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex min-h-0 flex-col rounded-[2rem] border border-white/10 bg-slate-900/55 p-10 shadow-xl backdrop-blur-md">
                    <h3 class="mb-6 text-xl font-semibold">Recent Pages</h3>
                    <div class="no-scrollbar flex-1 space-y-3 overflow-y-auto">
                        <template v-if="navigationStore.topVisited.length">
                            <button
                                v-for="item in navigationStore.topVisited"
                                :key="item.path"
                                class="group flex w-full items-center justify-between rounded-2xl border border-white/5 bg-[#2a2a40] px-5 py-4 text-left text-xs font-bold transition-all hover:border-indigo-500/40"
                                @click="router.push(item.path)"
                            >
                                {{ item.name }}
                                <span class="opacity-0 transition-opacity group-hover:opacity-100">→</span>
                            </button>
                        </template>
                        <div v-else class="flex h-full items-center justify-center text-xs text-white/20">No pages visited yet</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <DataDialog v-model:visible="editTaskModalVisible" :header="modalTitle" :busy="taskLoading" @close-modal="closeModal" @save-modal="saveTask">
        <div class="flex flex-col gap-6 p-2">
            <div class="flex flex-col gap-2">
                <label class="text-[10px] font-black tracking-widest text-white/40 uppercase">Title</label>
                <InputText v-model="modalItem.title" class="w-full" placeholder="Task title" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="text-[10px] font-black tracking-widest text-white/40 uppercase">Description</label>
                <Textarea v-model="modalItem.description" rows="4" class="w-full resize-none" placeholder="Add more context..." />
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-black tracking-widest text-white/40 uppercase">Status</label>
                    <Select v-model="modalItem.statusId" :options="statusOptions" optionLabel="text" optionValue="id" placeholder="Select status" class="w-full" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-black tracking-widest text-white/40 uppercase">Priority</label>
                    <Select v-model="modalItem.priority" :options="priorityOptions" optionLabel="text" optionValue="id" placeholder="Select priority" class="w-full" />
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-black tracking-widest text-white/40 uppercase">Project</label>
                    <Select v-model="modalItem.projectId" :options="projectOptions" optionLabel="name" optionValue="id" placeholder="Select project" class="w-full" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-black tracking-widest text-white/40 uppercase">Due Date</label>
                    <DatePicker v-model="modalItem.dueDate" class="w-full" placeholder="Select date" dateFormat="dd/mm/yy" />
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <label class="text-[10px] font-black tracking-widest text-white/40 uppercase">Parent Task</label>
                <Select v-model="modalItem.parentId" append-to="body" :options="tasks" optionLabel="title" optionValue="taskId" placeholder="Select parent task" filter class="w-full" />
            </div>
        </div>
    </DataDialog>

    <Popover ref="messagePanel" class="!border !border-white/10 !bg-gray-800 !shadow-xl">
        <div class="max-w-[400px] text-sm whitespace-pre-wrap text-gray-300">
            {{ selectedMessage }}
        </div>
    </Popover>
</template>

<style scoped>
.tabular-nums {
    font-variant-numeric: tabular-nums;
}
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
