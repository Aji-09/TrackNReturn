<template>
  <div class="min-h-screen flex flex-col  bg-zinc-50 dark:bg-zinc-900">
    <!-- Navbar for User Pages -->
    <NavbarUser class="w-full fixed top-0 left-0 right-0 z-10" />

    <main class="p-4 mt-20 overflow-hidden">
      <slot />
      <!-- Content for each page will be injected here -->
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute()

const shouldShowUserProfle = route.path !== '/user/lost-items'
</script>
