<template>
  <nav class="p-4 bg-zinc-100 border-b border-red-200 dark:bg-zinc-900 flex justify-between items-center">
    <NuxtLink to="/"><h1 class="text-xl font-bold text-red-600 dark:text-red-400">
      TrackNReturn
    </h1></NuxtLink>
    <ul class="flex gap-4">
      <!-- Login Button using UButton with manual routing -->
      
      <li>
        <DarkModeToggle />
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToLogin = () => {
  router.push('/auth/login'); // Navigate to login page
};

const navigateToRegister = () => {
  router.push('/auth/register'); // Navigate to register page
};
</script>
