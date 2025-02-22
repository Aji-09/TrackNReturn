<template>
    <div class="min-h-screen p-6">
      <h1 class="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-6">Found Items</h1>
      
      <div v-if="loading" class="text-center text-zinc-500">Loading items...</div>
      <div v-if="!loading && foundItems.length === 0" class="text-center text-zinc-500">No found items reported yet.</div>
      
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mt-8">
        <div 
          v-for="item in foundItems" 
          :key="item.id" 
          class="w-full p-4 border border-gray-300 dark:border-zinc-600 rounded-lg shadow-md"
        >
          <div class="relative">
            <!-- Display Cloudinary Image -->
            <div v-if="item.imageUrl" class="mb-4 overflow-hidden rounded-lg">
              <img 
                :src="item.imageUrl" 
                alt="Item Image" 
                class="w-full h-40 object-cover rounded-md shadow-md" 
              />
            </div>
  
            <h3 class="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-4">
              {{ item.itemName || 'Unknown Item' }}
            </h3>
            <p class="text-sm sm:text-md text-zinc-800 dark:text-zinc-200 mb-3">
              Reported by: <span class="font-semibold text-zinc-900 dark:text-zinc-100">{{ item.userId || 'Anonymous' }}</span>
            </p>
            <p class="text-sm sm:text-md text-zinc-800 dark:text-zinc-200 mb-3">
              Location: <span class="font-semibold text-zinc-900 dark:text-zinc-100">{{ item.locationFound || 'Unknown location' }}</span>
            </p>
  
            <p class="text-sm sm:text-md text-zinc-800 dark:text-zinc-200 mb-4">
              <strong class="text-zinc-900 dark:text-zinc-100">Description:</strong> {{ item.itemDescription || 'No description available.' }}
            </p>
  
            <p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Reported on: {{ formatDate(item.reportedAt) }}
            </p>
  
            <div class="absolute top-0 right-0 m-4 text-gray-500 hover:text-zinc-800">
              <!-- Claim Button Redirecting to Claim Page -->
              <button 
                @click="redirectToClaim(item)" 
                class="bg-red-500 text-white px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-red-600"
              >
                Request Claim
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
  import { useRouter } from "vue-router";
  
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
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };
  
  const redirectToClaim = (item: any) => {
    router.push(`/claim/${item.id}`);
  };
  
  onMounted(fetchFoundItems);
  
  definePageMeta({
    layout: 'user'
  });
  </script>
