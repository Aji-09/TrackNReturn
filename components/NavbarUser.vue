<template>
  <nav
    class="fixed p-4 bg-zinc-100 border-b border-red-200 dark:bg-zinc-900 flex justify-between items-center w-full"
  >
    <NuxtLink to="/user/dashboard">
      <h1 class="text-xl font-bold text-red-600 dark:text-red-400">
        TrackNReturn
      </h1>
    </NuxtLink>
    <!-- Desktop View -->
    <ul class="hidden md:flex gap-4 ml-auto items-center">
      <li>
        <UButton
          :color="isActive('/user/dashboard') ? 'primary' : 'primary'"
          :variant="isActive('/user/dashboard') ? 'solid' : 'subtle'"
          @click="navigateToUserDashboard"
        >
          Dashboard
        </UButton>
      </li>
      <li>
        <LogoutButton />
      </li>
      <li>
        <DarkModeToggle />
      </li>
    </ul>

    <!-- Mobile View (Hamburger + Dark Mode Toggle) -->
    <div class="md:hidden flex items-center gap-4">
      <!-- Dark Mode Toggle (Always on the right) -->
      <DarkModeToggle />

      <!-- Hamburger Menu Button -->
      <button class="p-2" @click="toggleMobileMenu">
        <svg
          class="w-6 h-6 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16m-7 6h7"
          ></path>
        </svg>
      </button>
    </div>

    <!-- Mobile Links (visible when hamburger is clicked) -->
    <div
      v-if="isMobileMenuOpen"
      class="absolute top-16 right-4 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-md flex flex-col gap-2 w-48 z-50"
    >
      <UButton
        :color="isActive('/user/dashboard') ? 'primary' : 'primary'"
        :variant="isActive('/user/dashboard') ? 'solid' : 'subtle'"
        @click="navigateToUserDashboard"
      >
        User Dashboard
      </UButton>

      <UButton
        :color="isActive('/user/lost-items') ? 'primary' : 'primary'"
        :variant="isActive('/user/lost-items') ? 'solid' : 'subtle'"
        @click="navigateToLostItems"
      >
        View Lost Items
      </UButton>

      <UButton
        :color="isActive('/user/report-lost-item') ? 'primary' : 'primary'"
        :variant="isActive('/user/report-lost-item') ? 'solid' : 'subtle'"
        @click="navigateToReportLostItem"
      >
        Report Lost Item
      </UButton>

      <UButton
        :color="isActive('/user/claims') ? 'primary' : 'primary'"
        :variant="isActive('/user/claims') ? 'solid' : 'subtle'"
        @click="navigateToClaims"
      >
        View Claims
      </UButton>

      <!-- Separator -->
      <div class="my-2 border-t border-zinc-300 dark:border-zinc-700"></div>

      <LogoutButton />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

// Navigation methods
const navigateToUserDashboard = () => {
  router.push("/user/dashboard");
};

const navigateToLostItems = () => {
  router.push("/user/lost-items");
};

const navigateToReportLostItem = () => {
  router.push("/user/report-lost-item");
};

const navigateToClaims = () => {
  router.push("/user/claims");
};

// Check if the current route is active
const isActive = (path: string) => {
  return route.path === path;
};
</script>
