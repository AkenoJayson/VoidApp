<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed, onBeforeUnmount, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getActiveComponentBackground } from '@/components/backgrounds';
import VortexBackground from '@/components/backgrounds/vortex.vue';
import AppBreadCrumb from './AppBreadcrumb.vue';
import AppConfig from './AppConfig.vue';
import AppProfileSidebar from './AppProfileSidebar.vue';
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';

const { layoutConfig, layoutState, watchSidebarActive, unbindOutsideClickListener } = useLayout();
const route = useRoute();

// Check if current route uses a component-based background
const componentBackground = computed(() => {
    return getActiveComponentBackground();
});

// Watch for route changes to trigger reactivity
watch(
    () => route.path,
    () => {
        // Component background will update automatically via computed
    }
);

onMounted(() => {
    layoutConfig.menuMode = 'reveal'; // 👈 enable reveal mode
    layoutState.anchored = false; // 👈 allow hover open/close
    layoutState.sidebarActive = false; // sidebar hidden by default
    watchSidebarActive();
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const containerClass = computed(() => {
    return {
        'layout-light': !layoutConfig.darkTheme,
        'layout-dark': layoutConfig.darkTheme,
        'layout-colorscheme-menu': layoutConfig.menuTheme === 'colorScheme',
        'layout-primarycolor-menu': layoutConfig.menuTheme === 'primaryColor',
        'layout-transparent-menu': layoutConfig.menuTheme === 'transparent',
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-slim': layoutConfig.menuMode === 'slim',
        'layout-slim-plus': layoutConfig.menuMode === 'slim-plus',
        'layout-horizontal': layoutConfig.menuMode === 'horizontal',
        'layout-reveal': layoutConfig.menuMode === 'reveal',
        'layout-drawer': layoutConfig.menuMode === 'drawer',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive,
        'layout-sidebar-active': layoutState.sidebarActive,
        'layout-sidebar-anchored': layoutState.anchored
    };
});
</script>

<template>
    <div :class="['layout-container', { ...containerClass }]">
        <!-- Component-based backgrounds render here -->
        <VortexBackground v-if="componentBackground?.isComponent" v-bind="componentBackground.componentProps" />

        <AppSidebar />

        <div class="layout-content-wrapper">
            <AppTopbar />
            <AppBreadCrumb class="content-breadcrumb"></AppBreadCrumb>
            <div class="layout-content">
                <router-view></router-view>
            </div>
        </div>

        <AppProfileSidebar />
        <AppConfig />

        <div class="layout-mask"></div>
    </div>
</template>

<style scoped>
/* Ensure layout container can contain the background */
.layout-container {
    position: relative;
}
</style>
