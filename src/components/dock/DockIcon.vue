<script setup lang="ts">
import { computed, inject, ref } from "vue";
import {
  DISTANCE_INJECTION_KEY,
  MAGNIFICATION_INJECTION_KEY,
  MOUSE_X_INJECTION_KEY,
  MOUSE_Y_INJECTION_KEY,
  ORIENTATION_INJECTION_KEY,
} from "@/components/dock/injectionKeys";

// 1. Define Props to receive the URL from the API
const props = defineProps<{
  href?: string;
  label?: string; // Optional: for accessibility/tooltips
}>();

const iconRef = ref<HTMLDivElement | null>(null);

const mouseX = inject(MOUSE_X_INJECTION_KEY, ref(Infinity));
const mouseY = inject(MOUSE_Y_INJECTION_KEY, ref(Infinity));
const distance = inject(DISTANCE_INJECTION_KEY);
const orientation = inject(ORIENTATION_INJECTION_KEY, "vertical");
const magnification = inject(MAGNIFICATION_INJECTION_KEY);
const isVertical = computed(() => orientation === "vertical");

// 2. Navigation Handler
const handleClick = () => {
  if (props.href) {
    window.open(props.href, "_blank", "noopener,noreferrer");
  }
};

function calculateDistance(val: number) {
  if (isVertical.value) {
    const bounds = iconRef.value?.getBoundingClientRect() || { y: 0, height: 0 };
    return val - bounds.y - bounds.height / 2;
  }
  const bounds = iconRef.value?.getBoundingClientRect() || { x: 0, width: 0 };
  return val - bounds.x - bounds.width / 2;
}

const iconWidth = computed(() => {
  const distanceCalc = isVertical.value
    ? calculateDistance(mouseY.value)
    : calculateDistance(mouseX.value);
    
  if (!distance?.value || !magnification?.value) return 60;
  
  if (Math.abs(distanceCalc) < distance.value) {
    return (1 - Math.abs(distanceCalc) / distance.value) * magnification.value + 40;
  }
  return 60;
});
</script>

<template>
  <div
    ref="iconRef"
    role="button"
    :aria-label="label"
    class="flex aspect-square cursor-pointer items-center justify-center rounded-full transition-all duration-200 ease-out hover:bg-white/10"
    :style="{
      width: `${iconWidth}px`,
      height: `${iconWidth}px`,
    }"
    @click="handleClick"
  >
    <div class="flex h-full w-full items-center justify-center p-[20%]">
      <slot />
    </div>
  </div>
</template>