<script setup>
import WebAppsService from '@/services/voidapi/webapps/WebAppsService';
import { onMounted, ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import Dock from '@/components/dock/Dock.vue';
import DockIcon from '@/components/dock/DockIcon.vue';
import { DockSeparator } from '@/components/dock';
import DataDialog from '@/components/vue/DataDialog.vue';
import handleAxiosError from '@/scripts/axios/Error';

// ─── View State ───────────────────────────────────────────────────────────────
const currentView = ref('dashboard');
const isDashboard = computed(() => currentView.value === 'dashboard');
const isGroups = computed(() => currentView.value === 'groups');

const toast = useToast();

// ─── Shared Helpers ───────────────────────────────────────────────────────────
const getIconUrl = (iconName) => {
    if (!iconName) return 'https://assets.voidtech.uk/svg/ethereum.svg';
    return `https://assets.voidtech.uk/svg/${iconName}.svg`;
};
const onIconError = (e) => {
    e.target.src = 'https://assets.voidtech.uk/svg/ethereum.svg';
};

const categoryIcons = {
    Streaming: 'pi pi-video',
    Finance: 'pi pi-chart-line',
    Development: 'pi pi-code',
    Server: 'pi pi-database',
    Applications: 'pi pi-th-large',
    Productivity: 'pi pi-briefcase'
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const loading = ref(true);
const dashCategories = ref([]);
const quickLinks = ref([]);
const activeCategory = ref(null);
const collapsedGroups = ref(new Set());
const searchQuery = ref('');
const bottomInput = ref('');
const selectedEngine = ref('Google');
const gmLoading = ref(false);
const gmSaving = ref(false);
const gmData = ref([]);
const gmActiveTypeId = ref(null);
const showNewGroupModal = ref(false);
const newGroup = ref({ name: '', displayName: '', sortOrder: 0 });
const draggingApp = ref(null);
const draggingFromGroup = ref(undefined);
const dragOverTarget = ref(null);
const gmActiveCategory = computed(() => gmData.value.find((c) => c.typeId === gmActiveTypeId.value));
const modifyGroupModalVisible = ref(false);
const modalTitle = ref('');
const modalItem = ref({});
const modalItemDefault = { name: null, displayName: null, categoryId: null, sortOrder: 9999 };
const categoryOptions = ref([]);

const searchOptions = [
    { name: 'Google', url: 'https://www.google.com/search?q=' },
    { name: 'Jayson', url: '', type: 'ai' }
];

const activeGroups = computed(() => {
    if (!activeCategory.value) return [];
    const cat = dashCategories.value.find((c) => c.typeDesc === activeCategory.value);
    if (!cat) return [];
    if (!searchQuery.value) return cat.groups;
    return cat.groups
        .map((g) => ({
            ...g,
            apps: g.apps.filter((a) => (a.displayName || a.name).toLowerCase().includes(searchQuery.value.toLowerCase()) || a.extName?.toLowerCase().includes(searchQuery.value.toLowerCase()))
        }))
        .filter((g) => g.apps.length > 0);
});

const activeTotalCount = computed(() => activeGroups.value.reduce((sum, g) => sum + g.apps.length, 0));

const toggleGroup = (groupId) => {
    const next = new Set(collapsedGroups.value);
    next.has(groupId) ? next.delete(groupId) : next.add(groupId);
    collapsedGroups.value = next;
};
const isGroupCollapsed = (id) => collapsedGroups.value.has(id);
const displayName = (app) => app.displayName || app.name;
const openApp = (app) => {
    if (app.url) window.open(app.url, '_blank', 'noopener,noreferrer');
};
const handleSearch = () => {
    const engine = searchOptions.find((e) => e.name === selectedEngine.value);
    if (bottomInput.value.trim()) {
        window.open(`${engine.url}${encodeURIComponent(bottomInput.value)}`, '_blank');
        bottomInput.value = '';
    }
};

const getCategoryOptions = async () => {
    try {
        const response = await WebAppsService.GetWebAppTypeCategory();
        categoryOptions.value = response.data;
    } catch (e) {
        handleAxiosError(e, toast);
    }
};

const getWebApps = async () => {
    try {
        const r = await WebAppsService.GetWebApps();
        dashCategories.value = r.data;
    } catch {
        dashCategories.value = [];
    } finally {
        loading.value = false;
    }
};

const getQuickLinks = async () => {
    try {
        const r = await WebAppsService.GetQuickLinks();
        quickLinks.value = r.data;
    } catch {
        quickLinks.value = [];
    }
};

const getGroupManagementData = async () => {
    gmLoading.value = true;
    try {
        const r = await WebAppsService.GetWebApps({ params: { groupManagement: true } });
        gmData.value = r.data;
    } catch {
        toast.add({ severity: 'error', summary: 'Failed to load group data', life: 3000 });
    } finally {
        gmLoading.value = false;
    }
};

const assignApp = async (Id, groupId) => {
    gmSaving.value = true;
    try {
        await WebAppsService.AssignAppToGroup({ Id, groupId });
        await getGroupManagementData();
        await pageRefresh();
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Save failed', detail: 'Could not assign app.', life: 3000 });
    } finally {
        gmSaving.value = false;
    }
};

const openModifyGroupModal = async (title, item) => {
    if (item) {
        const response = await WebAppsService.GetWebAppGroups({ params: { Id: item.groupId } });
        modalItem.value = { ...response.data[0], categoryId: item.categoryId, sortOrder: item.sortOrder || 9999 };
    } else {
        modalItem.value = { ...modalItemDefault, categoryId: gmActiveTypeId.value, sortOrder: 9999 };
    }
    modalTitle.value = title;
    modifyGroupModalVisible.value = true;
};

const closeModal = () => {
    modifyGroupModalVisible.value = false;
};

const groupSave = async () => {
    try {
        gmLoading.value = true;
        await WebAppsService.SaveWebAppGroup(modalItem.value);
        await pageRefresh();
        toast.add({ severity: 'success', summary: 'Group created', life: 3000 });
    } catch (e) {
        handleAxiosError(e, toast);
    } finally {
        gmLoading.value = false;
        modifyGroupModalVisible.value = false;
    }
};

const onDragStart = (app, fromGroupId) => {
    draggingApp.value = app;
    draggingFromGroup.value = fromGroupId;
};

const onDrop = async (targetGroupId) => {
    const app = draggingApp.value;
    if (!app || draggingFromGroup.value === targetGroupId) {
        dragOverTarget.value = null;
        return;
    }
    draggingApp.value = null;
    draggingFromGroup.value = undefined;
    dragOverTarget.value = null;
    await assignApp(app.id, targetGroupId);
};

const openGroupManagement = async () => {
    currentView.value = 'groups';
    if (!gmData.value.length) await getGroupManagementData();
    if (activeCategory.value) {
        const match = gmData.value.find((c) => c.typeDesc === activeCategory.value);
        if (match) gmActiveTypeId.value = match.typeId;
    }
};

const pageRefresh = async () => {
    await Promise.all([getWebApps(), getQuickLinks(), getCategoryOptions()]);
    if (isGroups.value) await getGroupManagementData();
};

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
    await Promise.all([getWebApps(), getQuickLinks(), getCategoryOptions()]);
    if (dashCategories.value.length) activeCategory.value = dashCategories.value[0].typeDesc;
});

watch(dashCategories, (v) => {
    if (!activeCategory.value && v.length) activeCategory.value = v[0].typeDesc;
});
</script>

<template>
    <div class="flex h-[820px] text-slate-200">
        <!-- Sidebar -->
        <aside class="flex w-20 shrink-0 flex-col gap-6 border-r border-white/5 bg-white/[0.02] p-4 lg:w-64">
            <div class="flex items-center gap-3 px-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                    <i class="pi pi-box text-sm text-white"></i>
                </div>
                <span class="hidden text-xl font-bold tracking-tight lg:block">VOID<span class="text-violet-500">OS</span></span>
            </div>

            <nav class="flex-1 space-y-1 overflow-y-auto">
                <button
                    v-for="cat in dashCategories"
                    :key="cat.typeId"
                    @click="
                        activeCategory = cat.typeDesc;
                        currentView = 'dashboard';
                    "
                    :class="[
                        'flex w-full items-center gap-4 rounded-xl px-3 py-3 transition-all duration-200',
                        isDashboard && activeCategory === cat.typeDesc ? 'border border-violet-500/20 bg-violet-600/20 text-violet-400' : 'text-slate-500 hover:bg-white/5'
                    ]"
                >
                    <i :class="[categoryIcons[cat.typeDesc] || 'pi pi-folder', 'shrink-0 text-lg']"></i>
                    <span class="hidden truncate font-medium lg:block">{{ cat.typeDesc }}</span>
                    <div v-if="isDashboard && activeCategory === cat.typeDesc" class="ml-auto hidden h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400 shadow-[0_0_8px_#a78bfa] lg:block"></div>
                </button>
            </nav>

            <div class="space-y-1 border-t border-white/5 pt-4">
                <p class="hidden px-3 pb-1 font-mono text-[9px] tracking-[2px] text-slate-600 uppercase lg:block">Settings</p>
                <button
                    @click="openGroupManagement"
                    :class="['flex w-full items-center gap-4 rounded-xl px-3 py-3 transition-all duration-200', isGroups ? 'border border-violet-500/20 bg-violet-600/20 text-violet-400' : 'text-slate-500 hover:bg-white/5']"
                >
                    <i class="pi pi-objects-column shrink-0 text-lg"></i>
                    <span class="hidden font-medium lg:block">Groups</span>
                    <div v-if="isGroups" class="ml-auto hidden h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400 shadow-[0_0_8px_#a78bfa] lg:block"></div>
                </button>
            </div>
        </aside>

        <div class="flex flex-1 flex-col overflow-hidden">
            <!-- ── Dashboard View ── -->
            <template v-if="isDashboard">
                <header class="flex h-20 shrink-0 items-center justify-between border-b border-white/5 px-8" style="background: rgba(10, 11, 16, 0.5); backdrop-filter: blur(12px)">
                    <div>
                        <h2 class="text-2xl font-bold text-white capitalize">{{ activeCategory }}</h2>
                        <p class="font-mono text-xs text-slate-500">{{ activeTotalCount }} services · {{ activeGroups.length }} groups</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="relative">
                            <i class="pi pi-search absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-500"></i>
                            <input v-model="searchQuery" type="text" placeholder="Search instance..." class="w-56 rounded-xl border border-white/10 bg-white/5 py-2 pr-4 pl-9 text-sm focus:ring-2 focus:ring-violet-500/50 focus:outline-none" />
                        </div>
                        <Button icon="pi pi-refresh" text rounded class="!h-8 !w-8 !text-gray-400" v-tooltip.top="'Refresh'" @click="pageRefresh" />
                    </div>
                </header>

                <div class="custom-scrollbar flex-1 space-y-8 overflow-y-auto px-8 py-6">
                    <div v-if="loading" class="flex h-40 items-center justify-center font-mono text-sm text-slate-500">Loading...</div>
                    <template v-else>
                        <div v-for="group in activeGroups" :key="group.groupId">
                            <div class="mb-3 flex cursor-pointer items-center gap-3" @click="toggleGroup(group.groupId)">
                                <div class="flex h-5 w-5 items-center justify-center rounded border border-white/10 bg-white/5 text-[9px] text-slate-500 transition-transform duration-200" :class="{ '-rotate-90': isGroupCollapsed(group.groupId) }">
                                    ▼
                                </div>
                                <span class="font-mono text-[11px] font-semibold tracking-[2px] text-slate-500 uppercase">{{ group.groupDisplayName || group.groupName }}</span>
                                <div class="h-px flex-1 bg-white/5"></div>
                                <span class="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] text-violet-400">{{ group.apps.length }} services</span>
                            </div>
                            <div v-show="!isGroupCollapsed(group.groupId)" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                <div
                                    v-for="app in group.apps"
                                    :key="app.id"
                                    class="service-card group relative flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 transition-all duration-200 hover:border-violet-500/25 hover:bg-white/[0.06]"
                                    @click="openApp(app)"
                                >
                                    <div class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-violet-500/20 bg-violet-500/10">
                                        <img :src="getIconUrl(app.extName || app.name)" class="h-full w-full object-contain p-1" :alt="displayName(app)" @error="onIconError" />
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <div class="truncate text-sm font-semibold text-white">{{ displayName(app) }}</div>
                                        <div class="mt-0.5 truncate font-mono text-[10px] text-slate-600">{{ app.name }}</div>
                                    </div>
                                    <div class="group/dot relative flex shrink-0 items-start" @click.stop>
                                        <div class="pointer-events-none absolute top-1/2 right-4 z-10 -translate-y-1/2 whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover/dot:opacity-100">
                                            <span class="rounded-md border border-violet-500/30 px-2 py-1 font-mono text-[10px] text-green-400" style="background: #12151c">{{ app.status || 'running' }}</span>
                                        </div>
                                        <div :class="['mt-0.5 h-2 w-2 rounded-full', app.state === 'running' ? 'bg-green-500 shadow-[0_0_6px_#22c55e]' : 'bg-red-500 shadow-[0_0_6px_#ef4444]']"></div>
                                    </div>
                                    <button
                                        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 opacity-0 transition-all group-hover:opacity-100 hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-400"
                                        @click.stop
                                        title="Settings"
                                    >
                                        <i class="pi pi-cog text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div v-if="activeGroups.length === 0" class="flex h-40 flex-col items-center justify-center gap-3 text-slate-600">
                            <i class="pi pi-inbox text-3xl"></i>
                            <span class="font-mono text-sm">No services found</span>
                        </div>
                    </template>
                </div>

                <div class="flex shrink-0 flex-col items-center gap-4 border-t border-white/5 px-8 py-4">
                    <Dock>
                        <template v-for="item in quickLinks" :key="item.id">
                            <DockSeparator v-if="item.type === 'separator'" />
                            <DockIcon v-else :href="item.url" :label="item.name" :title="item.name">
                                <img :src="getIconUrl(item.extName)" class="pointer-events-none size-full object-contain p-1" :alt="item.name" @error="onIconError" />
                            </DockIcon>
                        </template>
                    </Dock>
                    <div class="glass-dock flex w-full max-w-4xl items-center gap-2 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-xl">
                        <div class="flex flex-1 items-center rounded-xl border border-white/5 bg-white/5 transition-colors focus-within:border-violet-500/50">
                            <select v-model="selectedEngine" class="shrink-0 border-r border-white/10 bg-transparent px-4 text-xs font-bold text-slate-400 uppercase outline-none">
                                <option v-for="e in searchOptions" :key="e.name">{{ e.name }}</option>
                            </select>
                            <input v-model="bottomInput" @keyup.enter="handleSearch" type="text" placeholder="Execute command..." class="flex-1 bg-transparent px-6 py-3 text-base outline-none" />
                        </div>
                    </div>
                </div>
            </template>

            <!-- ── Group Management View ── -->
            <template v-if="isGroups">
                <header class="flex h-20 shrink-0 items-center justify-between border-b border-white/5 px-8" style="background: rgba(10, 11, 16, 0.5); backdrop-filter: blur(12px)">
                    <div>
                        <h2 class="text-2xl font-bold text-white" style="font-family: 'Rajdhani', sans-serif; letter-spacing: 1px">Group Management</h2>
                        <p class="font-mono text-[11px] text-slate-500">
                            drag services into groups · changes save automatically
                            <span v-if="gmSaving" class="ml-2 text-violet-400">saving...</span>
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button @click="openModifyGroupModal('Create Group', { categoryId: gmActiveTypeId })" class="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-violet-500">
                            <i class="pi pi-plus text-xs"></i> New Group
                        </button>
                        <Button icon="pi pi-refresh" text rounded class="!h-8 !w-8 !text-gray-400" v-tooltip.top="'Refresh'" @click="pageRefresh" />
                    </div>
                </header>

                <div class="flex shrink-0 gap-2 border-b border-white/5 px-8 py-3" style="background: rgba(10, 11, 16, 0.3)">
                    <button
                        v-for="cat in gmData"
                        :key="cat.typeId"
                        @click="gmActiveTypeId = cat.typeId"
                        :class="[
                            'rounded-xl border px-4 py-1.5 text-sm font-medium transition-all',
                            gmActiveTypeId === cat.typeId ? 'border-violet-500/20 bg-violet-600/20 text-violet-400' : 'border-white/[0.06] bg-white/[0.03] text-slate-500 hover:border-white/10 hover:text-slate-300'
                        ]"
                    >
                        {{ cat.typeDesc }}
                    </button>
                </div>

                <div v-if="gmLoading" class="flex flex-1 items-center justify-center font-mono text-sm text-slate-500">Loading...</div>

                <div v-else class="flex flex-1 overflow-hidden">
                    <!-- Unassigned Pool -->
                    <div class="flex w-72 shrink-0 flex-col border-r border-white/5" style="background: #12151c">
                        <div class="flex items-center justify-between border-b border-white/5 px-4 py-3">
                            <span class="font-mono text-[11px] tracking-[2px] text-slate-500 uppercase">Unassigned</span>
                            <span class="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] text-violet-400">{{ gmActiveCategory?.unassignedApps?.length ?? 0 }}</span>
                        </div>
                        <div
                            class="custom-scrollbar flex-1 space-y-2 overflow-y-auto p-3 transition-colors"
                            :class="dragOverTarget === 'pool' ? 'bg-violet-500/5' : ''"
                            @dragover.prevent="dragOverTarget = 'pool'"
                            @dragleave="dragOverTarget = null"
                            @drop.prevent="onDrop(null)"
                        >
                            <div v-if="!gmActiveCategory?.unassignedApps?.length" class="flex h-20 items-center justify-center rounded-xl border border-dashed border-white/10 font-mono text-xs text-slate-600">All assigned</div>
                            <div
                                v-for="app in gmActiveCategory?.unassignedApps"
                                :key="app.id"
                                class="flex cursor-grab items-center gap-3 rounded-xl border p-3 transition-all select-none"
                                :class="draggingApp?.id === app.id ? 'opacity-40' : 'border-white/[0.06] bg-white/[0.03] hover:border-violet-500/25 hover:bg-white/[0.06]'"
                                draggable="true"
                                @dragstart="onDragStart(app, null)"
                                @dragend="draggingApp = null"
                            >
                                <div class="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-violet-500/20 bg-violet-500/10">
                                    <img :src="getIconUrl(app.extName || app.name)" class="h-full w-full object-contain p-0.5" @error="onIconError" />
                                </div>
                                <div class="min-w-0 flex-1">
                                    <div class="truncate text-sm font-medium text-white">{{ app.displayName || app.name }}</div>
                                    <div class="truncate font-mono text-[10px] text-slate-600">{{ app.name }}</div>
                                </div>
                                <i class="pi pi-bars shrink-0 text-xs text-slate-600"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Groups Canvas -->
                    <div class="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-6">
                        <div
                            v-for="group in gmActiveCategory?.groups"
                            :key="group.groupId"
                            class="overflow-hidden rounded-xl border transition-all"
                            :class="dragOverTarget === group.groupId ? 'border-violet-500/50 shadow-[0_0_0_1px_rgba(124,58,237,0.3)]' : 'border-white/[0.06]'"
                            style="background: #161a23"
                            @dragover.prevent="dragOverTarget = group.groupId"
                            @dragleave="dragOverTarget = null"
                            @drop.prevent="onDrop(group.groupId)"
                        >
                            <div class="flex items-center gap-3 border-b border-white/5 px-4 py-3" style="background: #12151c">
                                <div class="h-5 w-0.5 shrink-0 rounded-full bg-violet-500"></div>
                                <div class="min-w-0 flex-1">
                                    <div class="text-sm font-semibold text-white">{{ group.groupDisplayName || group.groupName }}</div>
                                    <div class="font-mono text-[10px] text-slate-600">{{ group.groupName }}</div>
                                </div>
                                <span class="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-slate-500">{{ group.apps.length }}</span>
                                <button @click.stop="openModifyGroupModal('Edit Group', group)" class="flex h-6 w-6 items-center justify-center rounded-lg text-xs text-slate-600 transition-all hover:bg-violet-500/10 hover:text-violet-400">
                                    <i class="pi pi-pencil"></i>
                                </button>
                            </div>
                            <div class="flex min-h-[64px] flex-wrap gap-2 p-3 transition-colors" :class="dragOverTarget === group.groupId ? 'bg-violet-500/[0.04]' : ''">
                                <div
                                    v-if="!group.apps.length"
                                    class="flex w-full items-center justify-center rounded-lg border border-dashed py-3 font-mono text-xs"
                                    :class="dragOverTarget === group.groupId ? 'border-violet-500/40 text-violet-400' : 'border-white/10 text-slate-600'"
                                >
                                    Drop services here
                                </div>
                                <div
                                    v-for="app in group.apps"
                                    :key="app.id"
                                    class="flex cursor-grab items-center gap-2 rounded-lg border px-3 py-2 transition-all select-none"
                                    :class="draggingApp?.id === app.id ? 'opacity-40' : 'border-white/[0.08] bg-white/[0.04] hover:border-violet-500/30'"
                                    draggable="true"
                                    @dragstart="onDragStart(app, group.groupId)"
                                    @dragend="draggingApp = null"
                                >
                                    <div class="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded border border-violet-500/20 bg-violet-500/10">
                                        <img :src="getIconUrl(app.extName || app.name)" class="h-full w-full object-contain" @error="onIconError" />
                                    </div>
                                    <span class="text-xs font-medium whitespace-nowrap text-white">{{ app.displayName || app.name }}</span>
                                    <button class="ml-1 flex h-4 w-4 shrink-0 items-center justify-center text-[10px] text-slate-600 transition-colors hover:text-red-400" @click.stop="removeFromGroup(app)" title="Remove from group">✕</button>
                                </div>
                            </div>
                        </div>

                        <button
                            @click="openModifyGroupModal('Create Group', { categoryId: gmActiveTypeId })"
                            class="flex w-full items-center gap-3 rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-slate-600 transition-all hover:border-violet-500/30 hover:bg-violet-500/5 hover:text-violet-400"
                        >
                            <i class="pi pi-plus text-xs"></i> Add a new group
                        </button>
                    </div>
                </div>
            </template>
        </div>

        <!-- New Group Modal -->
        <DataDialog v-model:visible="modifyGroupModalVisible" :header="modalTitle" :busy="gmLoading" @close-modal="closeModal" @save="groupSave">
            <div class="flex flex-col gap-6 p-2">
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-black tracking-widest text-white/40 uppercase">Group Name</label>
                    <InputText v-model="modalItem.name" class="w-full" placeholder="Group name" />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-black tracking-widest text-white/40 uppercase">Parent Task</label>
                    <Select v-model="modalItem.categoryId" append-to="body" :options="categoryOptions" optionLabel="text" optionValue="id" placeholder="Select Category" filter class="w-full" />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-black tracking-widest text-white/40 uppercase">Sort Order</label>
                    <InputNumber v-model="modalItem.sortOrder" class="w-full" placeholder="Sort order" />
                </div>
            </div>
        </DataDialog>
    </div>
</template>

<style scoped>
.service-card:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
}
.glass-dock {
    box-shadow:
        0 0 40px rgba(0, 0, 0, 0.5),
        inset 0 0 1px rgba(255, 255, 255, 0.1);
}
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(124, 58, 237, 0.3);
}
</style>
