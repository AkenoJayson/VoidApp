<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const moduleInfo = ref({
    name: 'Management Hub',
    tagline: 'Management Hub',
    description: 'Welcome to the Management Hub.',
    metrics: []
});

const subPages = ref([
    {
        name: 'Calendar',
        url: '/management/calendar',
        icon: 'pi pi-fw pi-calendar',
        img: 'https://assets.voidtech.uk/hub/management/calendar.jpg'
    },
    {
        name: 'Wish List',
        url: '/management/wishlist',
        icon: 'pi pi-fw pi-list',
        img: 'https://assets.voidtech.uk/hub/management/wishlist.jpg'
    }
]);

const navigateTo = (url) => {
    if (!url) return;
    router.push(url);
};
</script>

<template>
    <div class="p-4 text-white sm:p-8 lg:p-12">
        <div class="grid grid-cols-1 gap-6 lg:gap-10">
            <div class="relative flex w-full flex-col gap-8 overflow-hidden rounded-[2rem] border border-white/5 bg-black/40 p-6 shadow-2xl backdrop-blur-xl sm:rounded-[3rem] sm:p-10 lg:flex-row lg:p-14">
                <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10"></div>

                <div class="relative z-10 flex-1">
                    <div class="mb-4 flex items-center gap-3">
                        <div class="h-px w-8 bg-indigo-500"></div>
                        <span class="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">{{ moduleInfo.tagline }}</span>
                    </div>
                    <h1 class="mb-4 text-3xl font-black tracking-tighter sm:text-5xl lg:text-7xl">{{ moduleInfo.name }}</h1>
                    <p class="max-w-3xl text-sm leading-relaxed text-white/60 sm:text-lg lg:text-xl">
                        {{ moduleInfo.description }}
                    </p>
                </div>

                <div class="relative z-10 grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-72 lg:grid-cols-1">
                    <div v-for="stat in moduleInfo.metrics" :key="stat.label" class="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-colors hover:bg-white/10 sm:p-6">
                        <span class="mb-1 block text-[9px] tracking-widest text-white/40 uppercase">{{ stat.label }}</span>
                        <span class="text-lg font-bold tracking-tight italic sm:text-2xl">{{ stat.value }}</span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div
                    v-for="sub in subPages"
                    :key="sub.name"
                    @click="navigateTo(sub.url)"
                    class="group relative h-28 cursor-pointer overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-lg transition-all hover:border-white/30 active:scale-[0.98] sm:h-48 sm:rounded-[2.5rem]"
                >
                    <div
                        v-if="sub.img"
                        class="absolute inset-0 scale-110 bg-cover bg-center opacity-10 grayscale transition-all duration-700 group-hover:scale-100 group-hover:opacity-50 group-hover:grayscale-0"
                        :style="{ backgroundImage: `url(${sub.img})` }"
                    ></div>

                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                    <div class="absolute inset-0 flex items-center justify-between px-6 py-4 sm:p-8">
                        <div class="flex items-center gap-4 sm:gap-6">
                            <div
                                class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-xl shadow-xl backdrop-blur-md transition-all group-hover:bg-indigo-500 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] sm:h-14 sm:w-14 sm:rounded-2xl sm:text-3xl"
                            >
                                <i :class="[sub.icon, 'transition-transform duration-500 group-hover:rotate-[12deg]']"></i>
                            </div>
                            <h3 class="text-lg font-bold tracking-tight transition-transform group-hover:translate-x-1 sm:text-2xl">{{ sub.name }}</h3>
                        </div>

                        <div class="hidden translate-x-4 transform opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 sm:block">
                            <i class="ri-arrow-right-line text-2xl text-indigo-400"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
