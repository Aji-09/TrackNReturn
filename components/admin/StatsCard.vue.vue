<script setup lang="ts">
defineProps({
  title: String,
  count: Number,
  color: String,
  link: String,
})
</script>

<template>
  <div class="bg-gray-800 p-4 rounded-lg shadow-md text-white">
    <h3 class="text-lg font-semibold">{{ title }}</h3>
    <p class="text-2xl font-bold">{{ count }}</p>
    <NuxtLink :to="link" class="text-sm text-gray-300 hover:text-white">View More →</NuxtLink>
  </div>
</template>
