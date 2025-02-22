<template>
  <div class="flex flex-col min-h-screen bg-zinc-100 dark:bg-zinc-900">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 w-full px-4 md:px-6">
      <!-- User Profile (Left) -->
      <UserProfile class="w-full p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg" />

      <!-- User Stats (Right) -->
      <UCard class="p-6 shadow-lg bg-white dark:bg-zinc-800 rounded-2xl">
        <h3 class="text-lg font-semibold text-primary">Your Stats</h3>
        <p class="text-sm text-zinc-700 dark:text-zinc-300">Overview of your activity.</p>

        <hr class="my-4 border-zinc-300 dark:border-zinc-700" />

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col items-center bg-zinc-200 dark:bg-zinc-700 p-4 rounded-xl">
            <div class="flex items-center gap-x-3">
              <UIcon name="lucide-package-search" class="text-primary w-6 h-6" />
              <div>
                <p class="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {{ yourLostItems }}
                </p>
                <p class="text-sm text-zinc-700 dark:text-zinc-300">Your Lost Items</p>
              </div>
            </div>
            <a
              class="text-primary text-sm flex items-center gap-1 mt-2 hover:underline"
              @click="navigateTo('/user/view-lost')"
            >
              View All <UIcon name="lucide-arrow-right" class="w-4 h-4" />
            </a>
          </div>

          <div class="flex flex-col items-center bg-zinc-200 dark:bg-zinc-700 p-4 rounded-xl">
            <div class="flex items-center gap-x-3">
              <UIcon name="lucide-check-circle" class="text-green-500 w-6 h-6" />
              <div>
                <p class="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {{ yourApprovedClaims }}
                </p>
                <p class="text-sm text-zinc-700 dark:text-zinc-300">Your Approved Claims</p>
              </div>
            </div>
            <a
              class="text-primary text-sm flex items-center gap-1 mt-2 hover:underline"
              @click="navigateTo('/user/claims')"
            >
              View All <UIcon name="lucide-arrow-right" class="w-4 h-4" />
            </a>
          </div>
        </div>
      </UCard>
    </div>

    <div class="flex-grow p-4 md:p-6">
      <main class="max-w-5xl mx-auto py-6 px-4">
        <h2 class="text-2xl font-bold text-red-600 dark:text-red-400">
          Welcome, {{ userName }}
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <UCard class="p-4 shadow-lg bg-white dark:bg-zinc-800 rounded-2xl">
            <h3 class="text-lg font-semibold">Track Items</h3>
            <p class="text-sm text-zinc-700 dark:text-zinc-300">
              View reported found items and lost items.
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <UButton color="primary" variant="solid" @click="navigateTo('/user/found-items')">
                <UIcon name="lucide-eye" class="mr-2" /> View Found Items
              </UButton>
              <UButton color="primary" variant="outline" @click="navigateTo('/user/lost-items')">
                <UIcon name="lucide-package-search" class="mr-2" /> View Lost Items
              </UButton>
            </div>
          </UCard>

          <UCard class="p-4 shadow-lg bg-white dark:bg-zinc-800 rounded-2xl">
            <h3 class="text-lg font-semibold">You Lost or Found Something?</h3>
            <p class="text-sm text-zinc-700 dark:text-zinc-300">
              Quickly report a found or lost item.
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <UButton color="primary" variant="solid" @click="navigateTo('/user/report-found-item')">
                <UIcon name="lucide-file-plus" class="mr-2" /> Report Found Item
              </UButton>
              <UButton color="primary" variant="outline" @click="navigateTo('/user/report-lost-item')">
                <UIcon name="lucide-alert-circle" class="mr-2" /> Report Lost Item
              </UButton>
            </div>
          </UCard>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useFirebaseAuth, useFirestore, useCollection, useDocument } from "vuefire";
import { collection, query, where, doc } from "firebase/firestore";

// Router
const router = useRouter();

// Firebase Authentication & Firestore
const auth = useFirebaseAuth();
const db = useFirestore();

// Reactive user data
const user = ref(auth?.currentUser || null);

// Ensure user data updates if it changes
onMounted(() => {
  auth?.onAuthStateChanged((newUser) => {
    user.value = newUser;
  });
});

// Fetch user details from Firestore
const userDocRef = computed(() => {
  return user.value?.uid ? doc(db, "users", user.value.uid) : null;
});
const userDoc = useDocument(userDocRef);

// Fetch user's lost items
const lostItemsQuery = query(
  collection(db, "lost_items"),
  where("userId", "==", user.value?.uid || "")
);
const lostItemsCollection = useCollection(lostItemsQuery);

// Fetch user's approved claims
const claimsQuery = query(
  collection(db, "claims"),
  where("userId", "==", user.value?.uid || ""),
  where("status", "==", "approved")
);
const approvedClaimsCollection = useCollection(claimsQuery);

// Computed properties for reactivity
const yourLostItems = computed(() => lostItemsCollection.value?.length || 0);
const yourApprovedClaims = computed(() => approvedClaimsCollection.value?.length || 0);

// Use "name" from Firestore, fallback to "User" if missing
const userName = computed(() => userDoc.value?.name || "User");

const navigateTo = (path: string) => {
  router.push(path);
};

// Define page metadata
definePageMeta({
  layout: "user",
});
</script>
