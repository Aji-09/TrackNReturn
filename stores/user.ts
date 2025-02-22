import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    shouldShowUserProfile: true,
  }),
  actions: {
    toggleShouldShowUserProfile(value: boolean) {
      this.shouldShowUserProfile = value;
    },
  },
});
