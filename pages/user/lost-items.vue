<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="text-center mt-8">
      <p class="text-lg text-gray-600 dark:text-zinc-300">Loading lost items...</p>
    </div>

    <!-- No Items -->
    <div v-else-if="lostItems.length === 0" class="text-center mt-8">
      <p class="text-lg text-gray-600 dark:text-zinc-300">No lost items reported yet.</p>
    </div>

    <!-- Items Grid -->
    <div v-else>
      <h1 class="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-6">Lost Items</h1>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div
          v-for="item in lostItems"
          :key="item.id"
          class="flex flex-col justify-between h-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-md p-4"
        >
          <!-- Image -->
          <div class="mb-4 aspect-[4/3] bg-zinc-200 dark:bg-zinc-700 rounded-md overflow-hidden">
            <img
              :src="getImageOrPlaceholder(item.imageUrl)"
              alt="Item Image"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Info -->
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-zinc-900 dark:text-white mb-2 truncate">
              {{ item.name }}
            </h3>
            <p class="text-sm text-zinc-700 dark:text-zinc-300 mb-1 truncate">
              <strong>By:</strong> {{ item.reportedBy }}
            </p>
            <p class="text-sm text-zinc-700 dark:text-zinc-300 mb-1 truncate">
              <strong>Location:</strong> {{ item.location }}
            </p>
            <p class="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
              <strong>Description:</strong> {{ item.description }}
            </p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Reported on: {{ formatDate(item.createdAt) }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex justify-between mt-auto pt-2">
            <button
              @click="redirectToClaim(item)"
              class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
            >
              Request Claim
            </button>
            <button
              @click="redirectToFoundForm(item)"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
            >
              Found It
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  getDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { usePlaceholderImage } from "@/composables/usePlaceholderImage";

const { getImageOrPlaceholder } = usePlaceholderImage();

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
        const reportedBy = data.userId
          ? await getUserDetails(data.userId)
          : "Anonymous";
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
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const redirectToClaim = (item: LostItem) => {
  router.push({
    path: `/claim/${item.id}`,
    query: {
      name: item.name,
      location: item.location,
      description: item.description,
      imageUrl: item.imageUrl || "",
      reportedBy: item.reportedBy,
    },
  });
};

const redirectToFoundForm = (item: LostItem) => {
  router.push({
    path: `/found-form/${item.id}`,
    query: {
      name: item.name,
      location: item.location,
      description: item.description,
      imageUrl: item.imageUrl || "",
      reportedBy: item.reportedBy,
    },
  });
};

definePageMeta({
  layout: "user",
});
</script>
