import { defineStore } from 'pinia';

export const useLoadingScreen = defineStore('loadingScreen', {
  state: () => ({
    isLoadingVisible: false,
  }),
  actions: {
    showLoading() {
      this.isLoadingVisible = true;
    },
    hideLoading() {
      this.isLoadingVisible = false;
    },
  },
});
