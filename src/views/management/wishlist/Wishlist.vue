<script setup>
/* --------------------------
   IMPORTS
--------------------------- */
import { ref, computed } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Rating from 'primevue/rating';
import Menu from 'primevue/menu';
import DataDialog from '@/components/vue/DataDialog.vue';

/* --------------------------
   INITIAL ITEM (example)
   NOTE: using the uploaded local file path as default image
--------------------------- */
const item = ref({
    title: 'Headphones',
    description: 'JBL Tune 520BT - Wireless On-Ear Headphones, Up to 57H Battery Life and Speed Charge, Lightweight, Comfortable and Foldable Design, Hands-Free Calls with Voice Aware (Black)',
    brand: 'JBL',
    rating: 4.5,
    ratingCount: 8531,
    color: 'Black',
    dateAdded: 'November 20, 2025',
    // Default image: path from uploaded file (developer instruction)
    image: '/mnt/data/ad94c632-805b-472a-8aa3-7b8a8578acbc.png',
    url: ''
});

/* --------------------------
   DIALOG STATE
--------------------------- */
const dialogVisible = ref(false);
const localItem = ref(JSON.parse(JSON.stringify(item.value))); // copy to edit
const originalItem = item; // keep reference for save

/* --------------------------
   STORE DEFINITIONS
   templates use {q} as replacement token
--------------------------- */
const stores = [
    { id: 'amazon', label: 'Amazon', searchUrl: 'https://www.amazon.com/s?k={q}', icon: '🛒' },
    { id: 'takealot', label: 'Takealot', searchUrl: 'https://www.takealot.com/all?search={q}', icon: '📦' },
    { id: 'google', label: 'Google', searchUrl: 'https://www.google.com/search?q={q}', icon: '🔎' }
    // Add more stores here
];

/* --------------------------
   MENU (optional contextual menu for card)
--------------------------- */
const menuRef = ref();
const menuItems = ref([{ label: 'Add a note', icon: 'pi pi-pencil' }, { label: 'Move', icon: 'pi pi-arrows-h' }, { label: 'Share', icon: 'pi pi-share-alt' }, { separator: true }, { label: 'Delete', icon: 'pi pi-trash', class: 'text-red-600' }]);
const openMenu = (event) => menuRef.value && menuRef.value.toggle(event);

/* --------------------------
   HELPERS
--------------------------- */
const openModal = () => {
    // populate local copy
    localItem.value = JSON.parse(JSON.stringify(originalItem.value));
    dialogVisible.value = true;
};

/* Open the product URL in new tab (launch button) */
const launchUrl = () => {
    if (localItem.value.url && localItem.value.url.trim().length > 0) {
        window.open(localItem.value.url, '_blank', 'noopener');
    }
};

/* Open a store search in new tab using the item's name as query */
const openStoreSearch = (store) => {
    const q = localItem.value.title ? localItem.value.title.trim() : '';
    if (!q) return;
    const url = store.searchUrl.replace('{q}', encodeURIComponent(q));
    window.open(url, '_blank', 'noopener');
};

/* Image upload handler: preview only (you can upload to backend in save) */
const onImageSelected = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
};

/* Allow pasting an image URL into a small input */
const setImageUrl = (value) => {
    if (value && value.trim().length > 0) {
        localItem.value.image = value.trim();
    }
};

/* Save handler: commit localItem to original item and close */
const save = () => {
    // basic validation (name required)
    if (!localItem.value.title || localItem.value.title.trim().length === 0) {
        // you can show a toast/validation message; simple alert here
        alert('Please enter an item name.');
        return;
    }

    // copy back values
    Object.assign(originalItem.value, JSON.parse(JSON.stringify(localItem.value)));
    dialogVisible.value = false;
};

/* Cancel/Close without saving */
const cancel = () => {
    dialogVisible.value = false;
};
</script>

<template>
    <!-- CARD: clicking opens the modal -->
    <div class="flex cursor-pointer gap-6 rounded-xl border border-[#5a4479] bg-[#3a2b4f] p-4 shadow-sm" @click="openModal">
        <!-- Left: Product Image -->
        <div class="flex w-32 items-center">
            <img :src="item.image" alt="gift" class="w-full rounded-md object-contain" />
        </div>

        <!-- Right: Info -->
        <div class="flex flex-1 flex-col gap-2 text-gray-100">
            <!-- Title -->
            <h2 class="text-lg font-semibold text-gray-100">{{ item.title }}</h2>

            <!-- Description (link-looking) -->
            <p class="cursor-pointer leading-snug text-blue-300 underline">{{ item.description }}</p>

            <!-- Brand + rating -->
            <p class="text-sm text-gray-300">by {{ item.brand }}</p>

            <div class="flex items-center gap-2">
                <Rating :modelValue="item.rating" readonly :cancel="false" />
                <span class="text-sm text-gray-300">{{ item.ratingCount.toLocaleString() }}</span>
            </div>

            <p class="text-sm text-gray-300">
                Color: <span class="font-medium text-gray-100">{{ item.color }}</span>
            </p>
            <p class="text-xs text-gray-400">Item added {{ item.dateAdded }}</p>

            <div class="flex flex-wrap items-center gap-3 pt-2">
                <Button label="See all buying options" class="p-button-plain p-button-outlined rounded-full border-gray-400 text-gray-100" />
                <Button label="Add a note" class="p-button-plain p-button-outlined rounded-full border-gray-400 text-gray-100" />
                <Button label="Move" class="p-button-plain p-button-outlined rounded-full border-gray-400 text-gray-100" />
                <Button icon="pi pi-share-alt" class="p-button-plain p-button-rounded p-button-outlined border-gray-400 text-gray-100" />
                <Button icon="pi pi-trash" class="p-button-plain p-button-rounded p-button-outlined border-gray-400 text-gray-100" />
                <Button icon="pi pi-ellipsis-v" class="p-button-plain p-button-rounded p-button-text text-gray-100" @click.stop="openMenu" />
                <Menu ref="menuRef" :model="menuItems" popup />
            </div>
        </div>
    </div>

    <!-- EDIT DIALOG -->
    <DataDialog v-model:visible="dialogVisible" header="Edit Gift Item" :busy="false" @save="save" @cancel="cancel">
        <div>
            <div class="grid grid-cols-12 gap-4">
                <!-- Avatar / Icon / Upload -->
                <div class="col-span-12 flex flex-col items-center gap-3 sm:col-span-2">
                    <Avatar :image="localItem.image" size="xlarge" shape="square" class="ring-1 ring-[#5a4479]" />
                    <input type="file" accept="image/*" @change="onImageSelected" class="w-full text-sm" />
                </div>

                <!-- Name + Launch button -->
                <div class="col-span-12 flex items-start gap-3 sm:col-span-8">
                    <div class="flex-1">
                        <label class="mb-1 block text-sm text-gray-300">Name</label>
                        <InputText v-model="localItem.title" placeholder="Item name" class="w-full rounded bg-[#20182a] p-2 text-gray-100" />
                    </div>
                    <div class="w-28">
                        <label class="invisible mb-1 block text-sm text-gray-300">Launch</label>
                        <Button :disabled="!localItem.url" icon="pi pi-external-link" class="p-button-plain w-full" @click="launchUrl" :tooltip="localItem.url ? 'Open product URL' : 'No URL set'" />
                    </div>
                </div>

                <!-- Launch URL input (full width) -->
                <div class="col-span-12">
                    <label class="mb-1 block text-sm text-gray-300">URL</label>
                    <InputText v-model="localItem.url" placeholder="https://example.com/product-link" class="w-full rounded bg-[#20182a] p-2 text-gray-100" />
                </div>

                <!-- Description -->
                <div class="col-span-12">
                    <label class="mb-1 block text-sm text-gray-300">Description</label>
                    <Textarea v-model="localItem.description" rows="4" class="w-full rounded bg-[#20182a] p-2 text-gray-100" />
                </div>

                <!-- Helper text + stores (only visible if name present) -->
                <div class="col-span-12">
                    <div v-if="localItem.title && localItem.title.trim().length > 0" class="mt-2">
                        <div class="mb-2 text-sm text-gray-300">
                            Want to find your item online? Choose a store below — we will search the store for:
                            <span class="font-semibold text-gray-100"> "{{ localItem.title }}"</span>
                        </div>

                        <!-- store icons row -->
                        <div class="flex items-center gap-3">
                            <template v-for="store in stores" :key="store.id">
                                <button type="button" @click="openStoreSearch(store)" class="flex min-w-[110px] items-center gap-2 rounded p-2 transition hover:bg-[#3a2b4f]">
                                    <span class="text-2xl">{{ store.icon }}</span>
                                    <div class="text-left">
                                        <div class="text-sm text-gray-100">{{ store.label }}</div>
                                        <div class="truncate text-xs text-gray-400">{{ store.searchUrl.replace('{q}', '...') }}</div>
                                    </div>
                                </button>
                            </template>
                        </div>
                    </div>

                    <div v-else class="mt-2 text-sm text-gray-500">Text: Want to find your item online? Choose a store here (visible when item name is filled)</div>
                </div>
            </div>
        </div>
    </DataDialog>
</template>

<style scoped>
/* Tailwind does most of the styling. Force PrimeVue button label/icon colors for dark theme */
:deep(.p-button-plain) {
    /* keep backgrounds transparent so tailwind/bg colors can show through */
    background-color: transparent !important;
}

:deep(.p-button-label) {
    color: #f3f4f6 !important; /* gray-100 */
}

:deep(.p-button-icon) {
    color: #f3f4f6 !important; /* gray-100 */
}

/* Smaller tweaks for dialog appearance */
:deep(.p-dialog .p-dialog-content) {
    background: transparent;
}
</style>
