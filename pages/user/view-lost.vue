<template>
  <div class="min-h-screen p-6 bg-zinc-100 dark:bg-zinc-900">
    <h1 class="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-6">
      Your Lost Items
    </h1>

    <div v-if="loading" class="text-center text-zinc-500 dark:text-zinc-400">
      Loading your lost items...
    </div>

    <div v-else-if="lostItems.length === 0" class="text-center text-zinc-500 dark:text-zinc-400">
      You have not reported any lost items yet.
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div
        v-for="item in lostItems"
        :key="item.id"
        class="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-md p-4"
      >
        <div class="mb-4">
          <img
            :src="getImageOrPlaceholder(item.imageUrl)"
            alt="Lost item"
            class="w-full h-40 object-cover rounded-md"
          />
        </div>
        <h3 class="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
          {{ item.name || 'Unnamed Item' }}
        </h3>
        <p class="text-sm text-zinc-700 dark:text-zinc-300">
          <strong>Description:</strong> {{ item.description || 'No description' }}
        </p>
        <p class="text-sm text-zinc-700 dark:text-zinc-300">
          <strong>Location:</strong> {{ item.location || 'Unknown' }}
        </p>
        <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
          {{ formatDate(item.createdAt) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFirestore, useCurrentUser } from 'vuefire'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { usePlaceholderImage } from '@/composables/usePlaceholderImage'

const db = useFirestore()
const user = useCurrentUser()
const lostItems = ref<any[]>([])
const loading = ref(true)
const { getImageOrPlaceholder } = usePlaceholderImage()

const fetchUserLostItems = async (uid: string) => {
  loading.value = true
  try {
    const q = query(
      collection(db, 'lost_items'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    lostItems.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching user lost items:', error)
  } finally {
    loading.value = false
  }
}

// ✅ Fetch immediately if already available
if (user.value?.uid) {
  fetchUserLostItems(user.value.uid)
}

// ✅ Watch in case it's loaded later
watch(user, (u) => {
  if (u?.uid) fetchUserLostItems(u.uid)
})

const formatDate = (timestamp: any) => {
  if (!timestamp) return 'Unknown'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

definePageMeta({
  layout: 'user',
})
</script>
c