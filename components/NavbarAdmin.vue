<template>
  <nav
    class="p-4 bg-zinc-100 border-b border-red-200 dark:bg-zinc-800 flex items-center justify-between"
  >
    <!-- Logo -->
    <h1 class="text-xl font-bold text-red-600 dark:text-red-400">
      TrackNReturn
    </h1>

    <!-- Desktop Navigation (Right-Aligned) -->
    <div class="hidden md:flex items-center gap-4 ml-auto">
      <UButton
        color="primary"
        variant="solid"
        @click="navigateToAdminDashboard"
      >
        Admin Dashboard
      </UButton>

      <!-- Popover Menu for Manage -->
      <UPopover mode="hover">
        <UButton label="Manage" color="primary" variant="solid" />
        <template #content>
          <div
            class="bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-md flex flex-col w-48"
          >
            <NuxtLink
              to="/admin/lost-items"
              class="block px-4 py-2 text-red-600 dark:text-red-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg"
            >
              Manage Items
            </NuxtLink>
            <NuxtLink
              to="/admin/claims"
              class="block px-4 py-2 text-red-600 dark:text-red-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg"
            >
              Manage Claims
            </NuxtLink>
            <NuxtLink
              to="/admin/users"
              class="block px-4 py-2 text-red-600 dark:text-red-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg"
            >
              Manage Users
            </NuxtLink>
            
            <!-- Separator -->
            <div class="my-2 border-t border-zinc-300 dark:border-zinc-700"></div>
          </div>
        </template>
      </UPopover>

      <LogoutButton />

      <!-- Dark Mode Toggle (Always at the far right on desktop) -->
      <div class="hidden md:block">
        <DarkModeToggle />
      </div>
    </div>

    <!-- Right Side (Dark Mode Toggle + Mobile Menu) -->
    <div class="flex items-center gap-4">
      <!-- Mobile Menu Button (☰) -->
      <button
        class="md:hidden p-2 ml-auto"
        @click="toggleMobileMenu"
      >
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

      <!-- Dark Mode Toggle (For Mobile) -->
      <div class="md:hidden">
        <DarkModeToggle />
      </div>
    </div>

    <!-- Mobile Dropdown Menu -->
    <div
      v-if="isMobileMenuOpen"
      class="absolute top-16 right-4 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-md flex flex-col w-48 z-50"
    >
      <UButton to="/admin/dashboard" variant="subtle" class="mb-2">
        Admin Dashboard
      </UButton>

      <UPopover mode="click" >
        <UButton
          label="Manage"
          color="primary"
          variant="solid"
          class="w-full"
        />
        <template #content>
          <div
            class="bg-white dark:bg-zinc-800 p-2 rounded-lg shadow-md flex flex-col w-48"
          >
            <NuxtLink
              to="/admin/lost-items"
              class="block px-4 py-2 text-red-600 dark:text-red-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg"
            >
              Manage Items
            </NuxtLink>
            <NuxtLink
              to="/admin/claims"
              class="block px-4 py-2 text-red-600 dark:text-red-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg"
            >
              Manage Claims
            </NuxtLink>
            <NuxtLink
              to="/admin/users"
              class="block px-4 py-2 text-red-600 dark:text-red-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg"
            >
              Manage Users
            </NuxtLink>
            
            <!-- Separator -->
            <div class="my-2 border-t border-zinc-300 dark:border-zinc-700"></div>
          </div>
        </template>
      </UPopover>

      <!-- Separator above Logout -->
      <div class="my-2 border-t border-zinc-300 dark:border-zinc-700"></div>

      <LogoutButton class="mt-2" />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// Watch window resize to reset menu on large screen
const handleResize = () => {
  if (window.innerWidth >= 768) {
    isMobileMenuOpen.value = false; // Close the mobile menu when going to desktop view
  }
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

const navigateToAdminDashboard = () => {
  router.push("/admin/dashboard");
};
</script>
