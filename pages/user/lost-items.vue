<template>
  <div>
    <!-- Show loading state -->
    <div v-if="loading" class="text-center mt-8">
      <p class="text-lg text-gray-600 dark:text-zinc-300">Loading lost items...</p>
    </div>

    <!-- Show if there are no lost items -->
    <div v-else-if="lostItems.length === 0" class="text-center mt-8">
      <p class="text-lg text-gray-600 dark:text-zinc-300">No lost items reported yet.</p>
    </div>

    <div v-else>
      <!-- Render lost items -->
      <h1 class="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-6">Lost Items</h1>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mt-8">
        <div 
          v-for="item in lostItems" 
          :key="item.id" 
          class="w-full p-4 border border-gray-300 dark:border-zinc-600 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out"
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
              {{ item.name }}
            </h3>
            <p class="text-sm sm:text-md text-zinc-800 dark:text-zinc-200 mb-3">
              Reported by: <span class="font-semibold text-zinc-900 dark:text-zinc-100">{{ item.reportedBy }}</span>
            </p>
            <p class="text-sm sm:text-md text-zinc-800 dark:text-zinc-200 mb-3">
              Location: <span class="font-semibold text-zinc-900 dark:text-zinc-100">{{ item.location }}</span>
            </p>
            <p class="text-sm sm:text-md text-zinc-800 dark:text-zinc-200 mb-4">
              <strong class="text-zinc-900 dark:text-zinc-100">Description:</strong> {{ item.description }}
            </p>
            <p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Reported on: {{ formatDate(item.createdAt) }}
            </p>

            <div class="flex justify-between items-center mt-4">
              <!-- Request Claim Button -->
              <button 
                @click="redirectToClaim(item)" 
                class="bg-red-500 text-white px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-red-600 focus:outline-none"
              >
                Request Claim
              </button>
              
              <!-- Found It Button -->
              <button 
                @click="redirectToFoundForm(item)" 
                class="bg-blue-500 text-white px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-blue-600 focus:outline-none"
              >
                Found It
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { getFirestore, collection, query, onSnapshot, getDoc, doc, Timestamp } from 'firebase/firestore';

interface LostItem {
  id: string;
  name: string;
  reportedBy: string;
  description: string;
  imageUrl: string | null;
  location: string;
  createdAt: Timestamp;
}

const db = getFirestore();
const router = useRouter();
const lostItems = ref<LostItem[]>([]);
const loading = ref(true);

const getUserDetails = async (userId: string): Promise<string> => {
  try {
    if (!userId) return "Anonymous";
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return `${userData.name} (${userData.email})`;
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
  }
  return "Anonymous";
};

onMounted(async () => {
  try {
    const lostItemsRef = collection(db, "lost_items");
    const q = query(lostItemsRef);
    onSnapshot(q, async (snapshot) => {
      const items: LostItem[] = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const reportedBy = data.userId ? await getUserDetails(data.userId) : "Anonymous";
        items.push({
          id: docSnap.id,
          name: data.name,
          reportedBy,
          description: data.description || "No description available.",
          imageUrl: data.imageUrl || null,
          location: data.location || "Unknown",
          createdAt: data.createdAt || Timestamp.fromDate(new Date()),
        });
      }
      lostItems.value = items;
      loading.value = false;
    });
  } catch (error) {
    console.error("Error fetching lost items: ", error);
    loading.value = false;
  }
});

const formatDate = (timestamp: Timestamp) => {
  const date = timestamp.toDate();
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const redirectToClaim = (item: LostItem) => {
  router.push({
    path: `/claim/${item.id}`,
    query: {
      name: item.name,
      location: item.location,
      description: item.description,
      imageUrl: item.imageUrl || '',
      reportedBy: item.reportedBy
    }
  });
};

const redirectToFoundForm = (item: LostItem) => {
  router.push({
    path: `/found-form/${item.id}`,
    query: {
      name: item.name,
      location: item.location,
      description: item.description,
      imageUrl: item.imageUrl || '',
      reportedBy: item.reportedBy
    }
  });
};

definePageMeta({
  layout: 'user',
});
</script>
