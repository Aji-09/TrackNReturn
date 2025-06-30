<template>
  <div class="min-h-screen p-6">
    <h1 class="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-6">Found Items</h1>

    <!-- Loading state -->
    <div v-if="loading" class="text-center text-zinc-500">Loading items...</div>

    <!-- Empty state -->
    <div v-else-if="foundItems.length === 0" class="text-center text-zinc-500">No found items reported yet.</div>

    <!-- Found items list -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
      <div
        v-for="item in foundItems"
        :key="item.id"
        class="w-full p-4 border border-gray-300 dark:border-zinc-600 rounded-lg shadow-md bg-white dark:bg-zinc-800 relative"
      >
        <!-- Image with fallback -->
        <div class="mb-4 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-700">
          <img
            :src="getImageOrPlaceholder(item.imageUrl)"
            alt="Item Image"
            class="w-full max-h-48 object-contain rounded-md shadow-md"
          />
        </div>

        <!-- Item details -->
        <h3 class="text-xl font-semibold text-zinc-900 dark:text-white mb-2 truncate">
          {{ item.itemName || 'Unknown Item' }}
        </h3>
        <p class="text-sm text-zinc-700 dark:text-zinc-300 mb-1">
          <strong>Reported by:</strong> {{ item.userId || 'Anonymous' }}
        </p>
        <p class="text-sm text-zinc-700 dark:text-zinc-300 mb-1">
          <strong>Location:</strong> {{ item.locationFound || 'Unknown location' }}
        </p>
        <p class="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
          <strong>Description:</strong> {{ item.itemDescription || 'No description available.' }}
        </p>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
          Reported on: {{ formatDate(item.reportedAt) }}
        </p>

        <!-- Claim button -->
        <div class="flex justify-end mt-2">
          <button
            @click="redirectToClaim(item)"
            class="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600"
          >
            Request Claim
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import { useRouter } from "vue-router";
import { usePlaceholderImage } from "@/composables/usePlaceholderImage";

const { getImageOrPlaceholder } = usePlaceholderImage();

const db = getFirestore();
const router = useRouter();
const foundItems = ref<any[]>([]);
const loading = ref(true);

const fetchFoundItems = async () => {
  try {
    const q = query(collection(db, "found_items"), orderBy("reportedAt", "desc"));
    const querySnapshot = await getDocs(q);
    foundItems.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching found items:", error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return "Unknown";
  const date = timestamp.toDate();
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

const redirectToClaim = (item: any) => {
  router.push(`/claim/${item.id}`);
};

onMounted(fetchFoundItems);

definePageMeta({
  layout: "user"
});
</script>
