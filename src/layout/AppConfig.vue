<script setup>
import { useLayout } from '@/layout/composables/layout';
import { $t, updatePreset, updateSurfacePalette } from '@primevue/themes';
import Aura from '@primevue/themes/aura';
import Lara from '@primevue/themes/lara';
import { ref } from 'vue';
import { getPresetExt, primaryColors } from '@/layout/composables/layout';

defineProps({
    simple: {
        type: Boolean,
        default: false
    }
});

const { layoutState, layoutConfig, setPrimary, setSurface, setPreset, setMenuMode, setMenuTheme, toggleDarkMode, isDarkTheme } = useLayout();

const presets = {
    Aura,
    Lara
};
const presetOptions = ref(Object.keys(presets));
const preset = ref(layoutConfig.preset);
const themeOptions = ref([
    { name: 'Light', value: false },
    { name: 'Dark', value: true }
]);
const darkTheme = ref(layoutConfig.darkTheme);
const menuMode = ref(layoutConfig.menuMode);
const menuTheme = ref(layoutConfig.menuTheme);

const surfaces = ref([
    {
        name: 'slate',
        palette: { 0: '#ffffff', 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' }
    },
    {
        name: 'gray',
        palette: { 0: '#ffffff', 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712' }
    },
    {
        name: 'zinc',
        palette: { 0: '#ffffff', 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b' }
    },
    {
        name: 'neutral',
        palette: { 0: '#ffffff', 50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4', 400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040', 800: '#262626', 900: '#171717', 950: '#0a0a0a' }
    },
    {
        name: 'stone',
        palette: { 0: '#ffffff', 50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e', 500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917', 950: '#0c0a09' }
    },
    {
        name: 'soho',
        palette: { 0: '#ffffff', 50: '#f4f4f4', 100: '#e8e9e9', 200: '#d2d2d4', 300: '#bbbcbe', 400: '#a5a5a9', 500: '#8e8f93', 600: '#77787d', 700: '#616268', 800: '#4a4b52', 900: '#34343d', 950: '#1d1e27' }
    },
    {
        name: 'viva',
        palette: { 0: '#ffffff', 50: '#f3f3f3', 100: '#e7e7e8', 200: '#cfd0d0', 300: '#b7b8b9', 400: '#9fa1a1', 500: '#87898a', 600: '#6e7173', 700: '#565a5b', 800: '#3e4244', 900: '#262b2c', 950: '#0e1315' }
    },
    {
        name: 'ocean',
        palette: { 0: '#ffffff', 50: '#fbfcfc', 100: '#F7F9F8', 200: '#EFF3F2', 300: '#DADEDD', 400: '#B1B7B6', 500: '#828787', 600: '#5F7274', 700: '#415B61', 800: '#29444E', 900: '#183240', 950: '#0c1920' }
    }
]);

function updateColors(type, color) {
    if (type === 'primary') {
        setPrimary(color.name);
    } else if (type === 'surface') {
        setSurface(color.name);
    }

    applyTheme(type, color);
}

function applyTheme(type, color) {
    if (type === 'primary') {
        updatePreset(getPresetExt());
    } else if (type === 'surface') {
        updateSurfacePalette(color.palette);
    }
}

function onPresetChange() {
    setPreset(preset.value);
    const presetValue = presets[preset.value];
    const surfacePalette = surfaces.value.find((s) => s.name === layoutConfig.surface)?.palette;

    $t().preset(presetValue).preset(getPresetExt()).surfacePalette(surfacePalette).use({ useDefaultOptions: true });
}
</script>

<template>
    <Drawer
        v-model:visible="layoutState.configSidebarVisible"
        position="right"
        class="layout-config-sidebar w-80"
        header="Settings"
        :pt="{
            pcCloseButton: { root: 'ml-auto' }
        }"
    >
        <div class="flex flex-col gap-4">
            <div>
                <span class="text-lg font-semibold">Primary</span>
                <div class="pt-2 flex gap-2 flex-wrap">
                    <button
                        v-for="primaryColor of primaryColors"
                        :key="primaryColor.name"
                        type="button"
                        @click="updateColors('primary', primaryColor)"
                        :class="['cursor-pointer w-6 h-6 rounded-full flex flex-shrink-0 items-center justify-center p-0 outline-none outline-offset-1', { 'outline-primary': layoutConfig.primary === primaryColor.name }]"
                        :style="{ backgroundColor: `${primaryColor.name === 'noir' ? 'var(--text-color)' : primaryColor.palette['500']}` }"
                    ></button>
                </div>
            </div>

            <div>
                <span class="text-lg font-semibold">Surface</span>
                <div class="pt-2 flex gap-2 flex-wrap">
                    <button
                        v-for="surface of surfaces"
                        :key="surface.name"
                        type="button"
                        @click="updateColors('surface', surface)"
                        :class="[
                            'cursor-pointer w-6 h-6 rounded-full flex flex-shrink-0 items-center justify-center p-0 outline-none outline-offset-1',
                            { 'outline-primary': layoutConfig.surface ? layoutConfig.surface === surface.name : isDarkTheme ? surface.name === 'zinc' : surface.name === 'slate' }
                        ]"
                        :style="{ backgroundColor: `${surface.palette['500']}` }"
                    ></button>
                </div>
            </div>

            <div>
                <div class="flex flex-col gap-2">
                    <span class="text-lg font-semibold">Presets</span>
                    <SelectButton v-model="preset" @change="onPresetChange" :options="presetOptions" :allowEmpty="false" />
                </div>
            </div>

            <div>
                <div class="flex flex-col gap-2">
                    <span class="text-lg font-semibold">Color Scheme</span>
                    <SelectButton v-model="darkTheme" @change="toggleDarkMode" :options="themeOptions" optionLabel="name" optionValue="value" :allowEmpty="false" />
                </div>
            </div>

            <template v-if="!simple">
                <div>
                    <div class="flex flex-col gap-2">
                        <span class="text-lg font-semibold">Menu Type</span>
                        <div class="flex flex-wrap flex-col gap-3">
                            <div class="flex">
                                <div class="flex items-center gap-2 w-1/2">
                                    <RadioButton name="menuMode" value="static" v-model="menuMode" @update:modelValue="setMenuMode" inputId="mode1"></RadioButton>
                                    <label for="mode1">Static</label>
                                </div>

                                <div class="flex items-center gap-2 w-1/2">
                                    <RadioButton name="menuMode" value="overlay" v-model="menuMode" @update:modelValue="setMenuMode" inputId="mode2"></RadioButton>
                                    <label for="mode2">Overlay</label>
                                </div>
                            </div>
                            <div class="flex">
                                <div class="flex items-center gap-2 w-1/2">
                                    <RadioButton name="menuMode" value="slim" v-model="menuMode" @update:modelValue="setMenuMode" inputId="mode3"></RadioButton>
                                    <label for="mode2">Slim</label>
                                </div>
                                <div class="flex items-center gap-2 w-1/2">
                                    <RadioButton name="menuMode" value="slim-plus" v-model="menuMode" @update:modelValue="setMenuMode" inputId="mode4"></RadioButton>
                                    <label for="mode3">Slim+</label>
                                </div>
                            </div>
                            <div class="flex">
                                <div class="flex items-center gap-2 w-1/2">
                                    <RadioButton name="menuMode" value="reveal" v-model="menuMode" @update:modelValue="setMenuMode" inputId="mode5"></RadioButton>
                                    <label for="mode4">Reveal</label>
                                </div>
                                <div class="flex items-center gap-2 w-1/2">
                                    <RadioButton name="menuMode" value="drawer" v-model="menuMode" @update:modelValue="setMenuMode" inputId="mode6"></RadioButton>
                                    <label for="mode5">Drawer</label>
                                </div>
                            </div>
                            <div class="flex">
                                <div class="flex items-center gap-2 w-1/2">
                                    <RadioButton name="menuMode" value="horizontal" v-model="menuMode" @update:modelValue="setMenuMode" inputId="mode7"></RadioButton>
                                    <label for="mode7">Horizontal</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="flex flex-col gap-2">
                        <span class="text-lg font-semibold">Menu Theme</span>
                        <div class="flex flex-wrap flex-col gap-4">
                            <div class="flex items-center gap-2">
                                <RadioButton v-model="menuTheme" value="colorScheme" :checked="menuTheme === 'colorScheme'" name="menuTheme" @change="() => setMenuTheme('colorScheme')" inputId="mode1"></RadioButton>
                                <label for="mode1">Color Scheme</label>
                            </div>

                            <div class="flex items-center gap-2">
                                <RadioButton v-model="menuTheme" value="primaryColor" :checked="menuTheme === 'primaryColor'" name="menuTheme" @change="() => setMenuTheme('primaryColor')" inputId="mode2"></RadioButton>
                                <label for="mode2">Primary Color</label>
                            </div>
                            <div class="flex items-center gap-2">
                                <RadioButton v-model="menuTheme" value="transparent" :checked="menuTheme === 'transparent'" name="menuTheme" @change="() => setMenuTheme('transparent')" inputId="mode3"></RadioButton>
                                <label for="mode2">Transparent</label>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </Drawer>
</template>
