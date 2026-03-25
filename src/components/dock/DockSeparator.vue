<script setup lang="ts">
import { ORIENTATION_INJECTION_KEY } from "@/components/dock/injectionKeys";
import { inject } from "vue";

const orientation = inject(ORIENTATION_INJECTION_KEY, "vertical");
</script>

<template>
  <div
    class="bg-white/20 relative block" 
    :class="[orientation === 'vertical' ? 'h-px w-4/5 mx-auto' : 'h-4/5 w-px my-auto']"
  />
</template>