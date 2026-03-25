<script setup>
import { computed, ref } from 'vue';
import AppSubMenu from './AppSubMenu.vue';

const model = ref([
    {
        label: '',
        icon: 'pi pi-fw pi-home',
        items: [
            {
                label: 'Dashboard',
                icon: 'pi pi-fw pi-home',
                to: '/dashboard'
            }
        ]
    },
    {
        label: 'Management',
        icon: 'pi pi-fw pi-server',
        items: [
            {
                label: 'Management Hub',
                icon: 'pi pi-fw pi-bolt',
                to: '/management/hub'
            }
        ]
    },
    {
        label: 'Home Server',
        icon: 'pi pi-fw pi-server',
        items: [
            {
                label: 'Server Hub',
                icon: 'pi pi-fw pi-circle-fill',
                to: '/homeserver/hub'
            }
        ]
    },
    {
        label: 'Budget',
        icon: 'pi pi-fw pi-dollar',
        items: [
            {
                label: 'Budget Hub',
                icon: 'ri-funds-box-line',
                to: '/budget/hub'
            }
            // {
            //     label: 'Shopping Lists',
            //     icon: 'pi pi-fw pi-book',
            //     to: '/budget/shoppinglist'
            // }
        ]
    },
    {
        label: 'Yt-Downloader',
        icon: 'pi pi-fw pi-video',
        items: [
            {
                label: 'Library',
                icon: 'pi pi-fw pi-youtube',
                to: '/ytdlp'
            }
        ]
    }
    // {
    //     label: 'Calendar',
    //     icon: 'pi pi-fw pi-calendar',
    //     items: [
    //         {
    //             label: 'Calendar',
    //             icon: 'pi pi-fw pi-calendar',
    //             to: '/calendar'
    //         }
    //     ]
    // },
    // {
    //     label: 'Wish List',
    //     icon: 'pi pi-fw pi-list',
    //     items: [
    //         {
    //             label: 'Wish List',
    //             icon: 'pi pi-fw pi-list',
    //             to: '/wishlist'
    //         }
    //     ]
    // }
]);
</script>

<template>
    <AppSubMenu :model="model" />
</template>

<style lang="scss" scoped></style>
