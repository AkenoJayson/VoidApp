<script setup>
import { useLoadingScreen } from '@/stores/LoadingScreenStore';
import { computed } from 'vue';

const loadingScreenStore = useLoadingScreen();
const isLoadingVisible = computed(() => loadingScreenStore.isLoadingVisible);
</script>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  color: white;
  text-align: center;
  font-size: 24px;
}
</style>

<template>
  <div v-if="isLoadingVisible" class="loading-screen">
    <div class="loading-content">
      <h1>Loading, Please wait!</h1>
    </div>
  </div>
</template>
