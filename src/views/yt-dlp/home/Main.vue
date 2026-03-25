<script setup>
import DataDialog from '@/components/vue/DataDialog.vue';
import YtdlpService from '@/services/ytdpl/main/YtdlpService';
import { useToast } from 'primevue/usetoast';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/security/user/AuthStore';

const ytdlpBaseUrl = import.meta.env.VITE_YTDLP_BASE_URL;
const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
const AuthStore = useAuthStore();
const toast = useToast();
const router = useRouter();
const downloadModalVisible = ref(false);
const historyModalVisible = ref(false);
const showYouTubeSearchDialog = ref(false);
const modalTitle = ref();
const modalBusy = ref(false);
const downloadModalItemDefault = {
    videoUrls: '',
    downloadType: 'video'
};
const historyModalItemDefault = {
    name: null,
    path: null,
    modTime: null,
    size: null
};
const modalItem = ref({});
const downloadHistory = ref([]);
const searchTerm = ref('');
const downloads = ref([]);
const titleCache = new Map();
const activeDownloads = ref(new Map());

// YouTube search state
const youtubeSearchQuery = ref('');
const youtubeSearchResults = ref([]);
const youtubeSearchLoading = ref(false);

let activeInterval = null;

const downloadTypes = [
    { label: 'Video', value: 'video' },
    { label: 'Audio', value: 'audio' }
];

const GetDownloads = async () => {
    try {
        var response = await YtdlpService.GetDownloads({ params: { subdir: '' } });
        downloadHistory.value = response.data;
    } catch (e) {
        toast.add({ severity: 'error', detail: 'Failed to load download history', life: 3000 });
    }
};

const refreshDownloadMap = async () => {
    try {
        activeDownloads.value.clear();

        const response = await YtdlpService.GetProcessingDownloads();
        if (response?.data?.length) {
            response.data.forEach((item) => {
                activeDownloads.value.set(item.info.url, item.id);
            });
        }
    } catch (e) {
        toast.add({ severity: 'error', detail: 'Failed to refresh downloads', life: 3000 });
    }
};

const GetProcessingDownloads = async () => {
    try {
        const response = await YtdlpService.GetProcessingDownloads();

        if (response?.data?.length) {
            response.data.forEach((item) => {
                activeDownloads.value.set(item.info.url, item.id);
            });
        }

        downloads.value = response.data.map((d) => {
            const url = d.info?.url || '';
            const thumb = getThumbnail(d);

            let status = 'queued';
            if (d.progress?.process_status === 2 || d.progress?.percentage === '-1') {
                status = 'completed';
            } else if (d.progress?.process_status === 1) {
                status = 'active';
            } else if (d.progress?.process_status === 3) {
                status = 'failed';
            }

            if (!titleCache.has(url)) {
                titleCache.set(url, null);
                fetchYouTubeTitle(url).then((t) => {
                    titleCache.set(url, t);
                    const item = downloads.value.find((x) => x.url === url);
                    if (item) item.title = t;
                });
            }

            return {
                id: d.id,
                url,
                title: titleCache.get(url),
                status,
                progress: d.progress?.percentage,
                speed: formatSpeed(d.progress?.speed),
                eta: formatEta(d.progress?.eta),
                sizeTotal: d.info?.filesize_approx || 0,
                sizeLeft: d.progress?.speed || 0,
                thumb,
                savedPath: d.output?.savedFilePath
            };
        });

        const hasQueuedOrActive = downloads.value.some((d) => d.status === 'active' || d.status === 'queued');

        if (hasQueuedOrActive && !activeInterval) {
            startActivePolling();
        } else {
            refreshDownloadMap();
        }
    } catch (e) {
        toast.add({
            severity: 'error',
            detail: 'Failed to load active downloads',
            life: 3000
        });
    }
};

const formatSpeed = (speed) => {
    if (!speed) return '0 KB/s';
    return (speed / 1024 / 1024).toFixed(2) + ' MB/s';
};

const formatEta = (eta) => {
    if (!eta) return '--';
    return eta + 's';
};

const getThumbnail = (d) => {
    if (d.info?.thumbnail) return d.info.thumbnail;

    const url = d.info?.url || '';
    const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);

    if (!match) return '/img/thumb-fallback.jpg';
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
};

const fetchYouTubeTitle = async (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (!match) return url;

    const videoId = match[1];

    try {
        const resp = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        const data = await resp.json();
        return data.title || url;
    } catch (e) {
        return url;
    }
};

const getProgressValue = (percentageStr) => {
    if (!percentageStr) return 0;
    return parseFloat(percentageStr.replace('%', '').trim()) || 0;
};

const encodeFilePath = (path) => {
    const base64 = btoa(String.fromCharCode(...new TextEncoder().encode(path)));
    return encodeURIComponent(base64);
};

const startActivePolling = () => {
    if (activeInterval) clearInterval(activeInterval);

    activeInterval = setInterval(async () => {
        const hasQueuedOrActive = downloads.value.some((d) => d.status === 'active' || d.status === 'queued');

        if (!hasQueuedOrActive) {
            clearInterval(activeInterval);
            activeInterval = null;
            GetProcessingDownloads();
            return;
        }

        try {
            const response = await YtdlpService.GetProcessingDownloads();
            const updated = response.data;

            downloads.value.forEach((item) => {
                const match = updated.find((u) => u.id === item.id);
                if (match) {
                    const newProgress = match.progress?.percentage;
                    if (newProgress && newProgress !== '-1') {
                        item.progress = newProgress;
                    }

                    item.speed = formatSpeed(match.progress?.speed);
                    item.eta = formatEta(match.progress?.eta);

                    if (match.progress?.percentage === '-1' || match.progress?.process_status === 2) {
                        item.status = 'completed';
                        item.progress = '100%';
                    } else if (match.progress?.process_status === 1) {
                        item.status = 'active';
                    } else if (match.progress?.process_status === 0) {
                        item.status = 'queued';
                    } else if (match.progress?.process_status === 3) {
                        item.status = 'failed';
                    }
                }
            });
        } catch (e) {}
    }, 1000);
};

const save = async () => {
    const urls = modalItem.value.videoUrls
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean);

    if (!urls.length) {
        toast.add({
            severity: 'info',
            detail: 'At least one URL is required',
            life: 3000
        });
        return;
    }

    try {
        modalBusy.value = true;

        for (const url of urls) {
            let params = [];

            if (modalItem.value.downloadType === 'audio') {
                const rawParams = '-x --embed-thumbnail --audio-format mp3';

                params = rawParams
                    .split(' ')
                    .map((p) => p.trim())
                    .filter(Boolean);
            }

            const payload = {
                method: 'Service.Exec',
                params: [
                    {
                        URL: url,
                        Params: params,
                        Path: '',
                        Rename: ''
                    }
                ],
                id: Date.now().toString() + Math.floor(Math.random() * 1000)
            };

            await YtdlpService.BaseYtdlpRPC(payload);
        }

        toast.add({
            severity: 'success',
            detail: 'Downloads started',
            life: 3000
        });

        closeModal();
        await GetProcessingDownloads();
    } catch (e) {
        toast.add({
            severity: 'error',
            detail: 'Failed to start downloads',
            life: 3000
        });
    } finally {
        modalBusy.value = false;
    }
};

const stopDownload = async (url) => {
    const jobId = activeDownloads.value.get(url);
    if (!jobId) return;

    const payload = {
        method: 'Service.Kill',
        params: [jobId],
        id: Date.now().toString()
    };

    var response = await YtdlpService.BaseYtdlpRPC(payload);

    if (response?.data?.error === null) {
        toast.add({ severity: 'success', detail: 'Download stopped', life: 3000 });
        clearInterval(activeInterval);
        activeInterval = null;
        await GetProcessingDownloads();
    } else {
        toast.add({ severity: 'error', detail: 'Failed to stop download', life: 3000 });
    }

    activeDownloads.value.delete(url);
};

const convertToAudio = async (item) => {
    modalBusy.value = true;

    const url = item.url;

    const stopResponse = await stopDownload(url);
    if (stopResponse?.data?.error) return;

    const rawParams = '-x --embed-thumbnail --audio-format mp3';

    const cleanedParams = rawParams
        .split(' ')
        .map((p) => p.trim())
        .filter(Boolean);

    const payload = {
        method: 'Service.Exec',
        params: [
            {
                URL: url,
                Params: cleanedParams,
                Path: '',
                Rename: ''
            }
        ],
        id: Date.now().toString() + Math.floor(Math.random() * 1000)
    };

    const downloadResponse = await YtdlpService.BaseYtdlpRPC(payload);

    if (downloadResponse?.data?.error) {
        toast.add({
            severity: 'error',
            detail: 'Failed to convert to audio',
            life: 3000
        });
    } else {
        toast.add({
            severity: 'success',
            detail: 'Video converted to audio',
            life: 3000
        });

        await GetProcessingDownloads();
        modalBusy.value = false;
    }
};

const retryDownload = async (item) => {
    try {
        modalBusy.value = true;

        const existingParams = item.params || [];

        var stopResponse = await stopDownload(item.url);

        if (stopResponse?.data?.error) {
            return;
        }

        const payload = {
            method: 'Service.Exec',
            params: [
                {
                    URL: item.url,
                    Params: existingParams,
                    Path: '',
                    Rename: ''
                }
            ],
            id: Date.now().toString() + Math.floor(Math.random() * 1000)
        };

        var downloadResponse = await YtdlpService.BaseYtdlpRPC(payload);

        if (downloadResponse?.data?.result) {
            activeDownloads.value.set(item.url, downloadResponse.data.result);
        }

        toast.add({ severity: 'success', detail: 'Downloads started', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', detail: 'Failed to retry download', life: 3000 });
    } finally {
        modalBusy.value = false;
    }
};

const downloadFile = async (item) => {
    const baseUrl = `${ytdlpBaseUrl}/filebrowser/d/`;
    const encodedPath = encodeFilePath(item.savedPath || item.path);
    const token = await AuthStore.loadStoredYtdlpAuth();
    const url = `${baseUrl}${encodedPath}?token=${token}`;
    window.open(url, '_blank');
};

const playFile = async (item) => {
    try {
        const baseUrl = `${ytdlpBaseUrl}/filebrowser/v/`;
        const encodedPath = encodeFilePath(item.savedPath || item.path);
        const token = await AuthStore.loadStoredYtdlpAuth();

        const url = `${baseUrl}${encodedPath}?token=${token}`;

        window.open(url, '_blank');
    } catch (e) {
        toast.add({
            severity: 'error',
            detail: 'Failed to open media',
            life: 3000
        });
    }
};

const clearItem = async (item) => {
    try {
        const jobId = activeDownloads.value.get(item.url);
        if (!jobId) {
            toast.add({
                severity: 'warn',
                detail: 'No job ID found',
                life: 3000
            });
            return;
        }

        const payload = {
            method: 'Service.Clear',
            params: [jobId],
            id: Date.now().toString()
        };

        const response = await YtdlpService.BaseYtdlpRPC(payload);

        if (response?.data?.error === null) {
            activeDownloads.value.delete(item.url);

            toast.add({
                severity: 'success',
                detail: 'Item cleared',
                life: 3000
            });

            await GetProcessingDownloads();
        } else {
            toast.add({
                severity: 'error',
                detail: 'Failed to clear item',
                life: 3000
            });
        }
    } catch (e) {
        toast.add({
            severity: 'error',
            detail: 'Failed to clear item',
            life: 3000
        });
    }
};

const clearAll = async () => {
    try {
        modalBusy.value = true;

        for (const [url, jobId] of activeDownloads.value.entries()) {
            const payload = {
                method: 'Service.Clear',
                params: [jobId],
                id: Date.now().toString()
            };

            await YtdlpService.BaseYtdlpRPC(payload);
        }

        activeDownloads.value.clear();

        toast.add({
            severity: 'success',
            detail: 'All items cleared',
            life: 3000
        });

        await GetProcessingDownloads();
    } catch (e) {
        toast.add({
            severity: 'error',
            detail: 'Failed to clear items',
            life: 3000
        });
    } finally {
        modalBusy.value = false;
    }
};

const deleteFile = async (item) => {
    try {
        modalBusy.value = true;

        var response = await YtdlpService.DeleteFromHistory(item.path);

        if (response?.data === 'ok') {
            toast.add({
                severity: 'success',
                detail: 'File deleted',
                life: 3000
            });
            await GetDownloads();
        } else {
            toast.add({
                severity: 'error',
                detail: 'Failed to delete file',
                life: 3000
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        modalBusy.value = false;
    }
};

const closeModal = () => {
    downloadModalVisible.value = false;
    historyModalVisible.value = false;
};

const openAddDownloadModal = (title, item) => {
    if (item) {
        modalItem.value = {
            videoUrls: item.url,
            customFormats: item.params
        };
    } else {
        modalItem.value = { ...downloadModalItemDefault };
    }
    modalTitle.value = title;
    downloadModalVisible.value = true;
};

const openDownloadHistoryModal = (title) => {
    modalItem.value = { ...historyModalItemDefault };
    modalTitle.value = title;
    try {
        modalBusy.value = true;
        GetDownloads();
    } catch (e) {
        toast.add({ severity: 'error', detail: 'Failed to load download history', life: 3000 });
    } finally {
        modalBusy.value = false;
        historyModalVisible.value = true;
    }
};

const openYouTubeSearchModal = () => {
    youtubeSearchQuery.value = '';
    youtubeSearchResults.value = [];
    showYouTubeSearchDialog.value = true;
};

const searchYouTube = async () => {
    const query = youtubeSearchQuery.value.trim();

    if (!query) {
        toast.add({ severity: 'info', detail: 'Please enter a search term', life: 3000 });
        return;
    }

    try {
        youtubeSearchLoading.value = true;
        youtubeSearchResults.value = [];

        const params = new URLSearchParams({
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: 10,
            key: youtubeApiKey
        });

        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'YouTube API error');
        }

        youtubeSearchResults.value = (data.items || []).map((item) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));
    } catch (e) {
        toast.add({ severity: 'error', detail: e.message || 'Failed to search YouTube', life: 3000 });
    } finally {
        youtubeSearchLoading.value = false;
    }
};

const addFromYouTube = (result) => {
    showYouTubeSearchDialog.value = false;
    openAddDownloadModal('Add New Download', { url: result.url, params: [] });
};

const filteredDownloads = computed(() => {
    if (!searchTerm.value) return downloadHistory.value;

    return downloadHistory.value.filter((item) => item.name.toLowerCase().includes(searchTerm.value.toLowerCase()));
});

const checkLogin = async () => {
    try {
        const isLoggedIn = await AuthStore.CheckYtdlpAuth();
        if (!isLoggedIn) {
            toast.add({
                severity: 'error',
                detail: 'Not loggedd in. Redirecting to login.',
                life: 3000
            });
            router.push({ name: 'YTLogin' });
        }
    } catch (e) {
        toast.add({
            severity: 'error',
            detail: 'Failed to check login status',
            life: 3000
        });
    } finally {
        GetProcessingDownloads();
    }
};

onMounted(async () => {
    await checkLogin();
});
</script>

<template>
    <div class="p-4 pb-48 text-gray-100 md:p-10">
        <header class="mx-auto mb-10 flex max-w-[1600px] flex-wrap items-end justify-between gap-6">
            <div>
                <h1 class="mb-1 text-4xl font-black tracking-tight text-white">Media Library</h1>
            </div>

            <div class="flex gap-4">
                <button @click="clearAll()" class="pi pi-times text-gray-500" v-tooltip.top="'Clear All Completed'"></button>
                <button @click="GetProcessingDownloads()" class="pi pi-refresh text-gray-500"></button>
                <span class="p-input-icon-left">
                    <i class="pi pi-search mr-4 text-gray-500" />
                    <InputText placeholder="Search library..." class="focus:!border-primary-500 w-72 !rounded-xl !border-white/10 !bg-black/40 backdrop-blur-md" />
                </span>
            </div>
        </header>

        <main class="mx-auto max-w-[1600px]">
            <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                <div v-for="item in downloads" :key="item.id" class="group hover:border-primary-500/50 relative overflow-hidden rounded-2xl border border-white/5 bg-black/60 shadow-2xl backdrop-blur-sm transition-all duration-500">
                    <div class="relative aspect-video overflow-hidden bg-zinc-900">
                        <img :src="item.thumb" class="h-full w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-30" />
                        <div v-if="item.status === 'active'" class="absolute inset-0 flex flex-col justify-end bg-black/60 p-5 backdrop-blur-[2px]">
                            <div class="text-primary-400 mb-2 flex justify-between font-mono text-[10px] font-bold uppercase">
                                <span>{{ item.speed }}</span>
                                <span>{{ item.eta }}</span>
                            </div>
                            <ProgressBar :value="getProgressValue(item.progress)" class="!h-1.5 !bg-white/10" :showValue="false" />

                            <div class="mt-2 text-right text-2xl font-black text-white italic">{{ item.progress }}</div>
                        </div>
                        <div v-if="item.status === 'completed'" class="absolute top-3 right-3 rounded-full bg-green-500/90 p-1.5 shadow-xl backdrop-blur-md">
                            <i class="pi pi-check text-xs font-bold text-white" />
                        </div>
                        <div v-if="item.status === 'failed'" class="absolute inset-0 flex items-center justify-center bg-red-950/40 p-4 backdrop-blur-sm">
                            <div class="text-center">
                                <i class="pi pi-exclamation-circle mb-2 text-2xl text-red-500" />
                                <p class="text-[10px] leading-tight font-bold text-red-100 uppercase">
                                    {{ item.error || 'Failed' }}
                                </p>
                            </div>
                        </div>
                        <div class="absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button v-if="item.status !== 'completed'" icon="pi pi-replay" rounded severity="primary" class="!h-12 !w-12" v-tooltip.top="'Restart Download'" @click="retryDownload(item)" />
                            <Button v-if="item.status !== 'completed'" icon="pi pi-trash" rounded severity="danger" v-tooltip.top="'Delete File'" @click="stopDownload(item.url)" />
                            <Button v-if="item.status !== 'completed'" icon="pi pi-th-large" rounded severity="info" v-tooltip.top="'Convert to Audio'" @click="convertToAudio(item)" />
                            <Button v-if="item.status === 'completed'" icon="pi pi-play" rounded severity="info" v-tooltip.top="'Play File'" @click="playFile(item)" />
                            <Button v-if="item.status === 'completed'" icon="pi pi-download" rounded severity="success" v-tooltip.top="'Download File'" @click="downloadFile(item)" />
                            <Button v-if="item.status === 'completed'" icon="pi pi-times" rounded severity="danger" v-tooltip.top="'Clear Item'" @click="clearItem(item)" />
                        </div>
                    </div>
                    <div class="p-4">
                        <h3 class="group-hover:text-primary-400 line-clamp-2 min-h-[40px] text-sm leading-tight font-bold text-gray-100 transition-colors">
                            {{ item.title }}
                        </h3>
                        <div class="mt-2 line-clamp-2 text-[11px] break-words text-gray-500">
                            {{ item.url }}
                        </div>
                        <div class="mt-3 flex items-center justify-between">
                            <span class="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                                {{ item.status }}
                            </span>
                            <span v-if="item.quality" class="border-primary-500/20 bg-primary-500/10 text-primary-400 rounded border px-2 py-0.5 font-mono text-[10px]">
                                {{ item.quality }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <nav class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
            <div class="flex w-[20rem] items-center justify-between rounded-xl border border-white/10 bg-zinc-900/70 px-6 py-2 backdrop-blur-md">
                <Button icon="pi pi-history" text v-tooltip.top="'Download History'" class="!h-12 !w-12 !text-xl !text-gray-400 hover:!text-white" @click="openDownloadHistoryModal('Download History')" />
                <Button icon="pi pi-plus" v-tooltip.top="'Add New Download'" class="!h-16 !w-16 !rounded-full !border-none !bg-purple-600 !text-white transition-transform hover:scale-105" @click="openAddDownloadModal('Add New Download')" />
                <Button icon="pi pi-search" text v-tooltip.top="'Search YouTube'" class="!h-12 !w-12 !text-xl !text-gray-400 hover:!text-white" @click="openYouTubeSearchModal()" />
            </div>
        </nav>

        <!-- Add Download Modal -->
        <DataDialog v-model:visible="downloadModalVisible" :header="modalTitle" :busy="modalBusy" @close-modal="closeModal" :style="{ width: '700px' }" @save="save">
            <div class="mb-4 flex flex-wrap hover:!bg-transparent">
                <div class="flex grow flex-col gap-2">
                    <label for="videoUrls">Video URLs (one per line)</label>
                    <Textarea v-model="modalItem.videoUrls" id="videoUrls" rows="5" placeholder="Paste one URL per line" />
                </div>
            </div>

            <div class="mb-4 flex flex-wrap">
                <div class="flex grow flex-col gap-2">
                    <label for="downloadType">Download Type</label>
                    <Select id="downloadType" v-model="modalItem.downloadType" :options="downloadTypes" optionLabel="label" optionValue="value" placeholder="Select Type" class="w-full" />
                </div>
            </div>
        </DataDialog>

        <!-- Download History Modal -->
        <DataDialog v-model:visible="historyModalVisible" :header="modalTitle" :busy="modalBusy" :hide-footer="true">
            <div class="mb-4 flex items-center justify-between">
                <Button @click="GetDownloads()">Refresh</Button>

                <div class="flex items-center gap-2">
                    <i class="pi pi-search text-zinc-400"></i>
                    <InputText v-model="searchTerm" placeholder="Search" class="w-56" />
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <div v-for="(item, index) in filteredDownloads" :key="index" class="w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4 shadow transition-all hover:shadow-lg">
                    <div class="flex items-center justify-between gap-4">
                        <div class="min-w-0 flex-1">
                            <div class="mb-2 text-sm font-semibold break-words text-white">
                                {{ item.name }}
                            </div>

                            <div class="flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-300">
                                <div>
                                    <span class="font-medium text-zinc-200">Size:</span>
                                    {{ (item.size / 1024 / 1024).toFixed(2) }} MB
                                </div>

                                <div>
                                    <span class="font-medium text-zinc-200">Download Date:</span>
                                    {{ new Date(item.modTime).toLocaleString() }}
                                </div>

                                <div>
                                    <span class="font-medium text-zinc-200">Type:</span>
                                    {{ item.isVideo ? 'Video' : 'Audio' }}
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-2">
                            <Button icon="pi pi-play" rounded severity="info" size="small" v-tooltip.top="'Play'" @click="playFile(item)" />
                            <Button icon="pi pi-download" rounded severity="success" v-tooltip.top="'Download File'" @click="downloadFile(item)"></Button>
                            <Button icon="pi pi-trash" rounded severity="danger" size="small" v-tooltip.top="'Delete'" @click="deleteFile(item)" />
                        </div>
                    </div>
                </div>
            </div>
        </DataDialog>

        <!-- YouTube Search Modal -->
        <DataDialog v-model:visible="showYouTubeSearchDialog" header="Search YouTube" :busy="youtubeSearchLoading" :hide-footer="true" :style="{ width: '780px' }">
            <div class="mb-5 flex gap-2">
                <InputText v-model="youtubeSearchQuery" placeholder="Search for a video..." class="grow" @keyup.enter="searchYouTube()" />
                <Button label="Search" icon="pi pi-search" :loading="youtubeSearchLoading" @click="searchYouTube()" />
            </div>

            <div v-if="youtubeSearchLoading" class="flex justify-center py-10">
                <i class="pi pi-spinner pi-spin text-3xl text-zinc-400" />
            </div>

            <div v-else-if="youtubeSearchResults.length === 0 && youtubeSearchQuery" class="py-10 text-center text-zinc-500">No results found. Try a different search term.</div>

            <div v-else-if="youtubeSearchResults.length === 0" class="py-10 text-center text-zinc-500">Enter a search term above to find videos.</div>

            <div v-else class="flex flex-col gap-3">
                <div v-for="result in youtubeSearchResults" :key="result.videoId" class="flex gap-4 rounded-2xl border border-zinc-700 bg-zinc-800 p-3 transition-all hover:border-zinc-500">
                    <img :src="result.thumbnail" :alt="result.title" class="h-24 w-40 flex-shrink-0 rounded-lg object-cover" />

                    <div class="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                            <div class="mb-1 line-clamp-2 text-sm font-semibold text-white">{{ result.title }}</div>
                            <div class="text-xs text-zinc-400">{{ result.channel }} &middot; {{ result.publishedAt }}</div>
                        </div>

                        <div class="mt-2 flex items-center gap-2">
                            <Button label="Download" icon="pi pi-download" size="small" severity="success" @click="addFromYouTube(result)" />
                            <a :href="result.url" target="_blank" class="text-xs text-zinc-500 underline hover:text-zinc-300"> Open on YouTube </a>
                        </div>
                    </div>
                </div>
            </div>
        </DataDialog>
    </div>
</template>

<style>
.p-tooltip .p-tooltip-text {
    background: #18181b !important;
    color: #fff !important;
    font-size: 12px;
    font-weight: 700;
    padding: 0.6rem 1.2rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
}

::-webkit-scrollbar {
    width: 8px;
}
::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
}
</style>
