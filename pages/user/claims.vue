<template>
  <div class="min-h-screen p-6 bg-zinc-100 dark:bg-zinc-900">
    <h2 class="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-6">
      Your Claims
    </h2>

    <div v-if="loading" class="text-center text-zinc-500 dark:text-zinc-400">
      Loading your claims...
    </div>

    <div v-else-if="claims.length === 0 && claimHistory.length === 0" class="text-center text-zinc-500 dark:text-zinc-400">
      You have no claims yet.
    </div>

    <!-- Your Claim Request Section -->
    <div v-if="claims.length > 0">
      <h3 class="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Your Claim Request</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div v-for="claim in claims" :key="claim.id" class="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-md p-4">
          <div class="mb-4">
            <img :src="claim.imageUrl || '/placeholder.jpg'" alt="Claim Image" class="w-full h-40 object-cover rounded-md" />
          </div>
          <h3 class="text-xl font-semibold text-zinc-900 dark:text-white mb-2">{{ claim.itemName }}</h3>
          <p class="text-sm text-zinc-700 dark:text-zinc-300">
            <strong>Status:</strong> <span :class="statusTextColor(claim.status)">{{ claim.status }}</span>
            <span :class="statusIconClass(claim.status)" class="ml-2"></span>
          </p>
          <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            {{ formatDate(claim.createdAt) }}
          </p>
          <UButton v-if="claim.status === 'Pending'" @click="cancelClaim(claim.id)" class="mt-3">
            Cancel Claim
          </UButton>
        </div>
      </div>
    </div>

    <!-- Claim History Section -->
    <div v-if="claimHistory.length > 0" class="mt-10">
      <h3 class="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Claim History</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div v-for="claim in claimHistory" :key="claim.id" class="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-md p-4">
          <div class="mb-4">
            <img :src="claim.imageUrl || '/placeholder.jpg'" alt="Claim Image" class="w-full h-40 object-cover rounded-md" />
          </div>
          <h3 class="text-xl font-semibold text-zinc-900 dark:text-white mb-2">{{ claim.itemName }}</h3>
          <p class="text-sm text-zinc-700 dark:text-zinc-300">
            <strong>Status:</strong> <span :class="statusTextColor(claim.status)">{{ claim.status }}</span>
            <span :class="statusIconClass(claim.status)" class="ml-2"></span>
          </p>
          <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            {{ formatDate(claim.createdAt) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { useFirestore, useCurrentUser } from "vuefire";
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc, getDoc } from "firebase/firestore";
import type { DocumentData, Query } from "firebase/firestore";

interface Claim {
  id: string;
  userId: string;
  itemId: string;
  itemName: string;
  status: string;
  imageUrl?: string;
  createdAt: any;
}

interface LostItem {
  name: string;
  imageUrl: string;
}

const db = useFirestore();
const user = useCurrentUser();
const claims = ref<Claim[]>([]);
const claimHistory = ref<Claim[]>([]);
const loading = ref(true);

watchEffect(() => {
  const currentUser = user.value;
  if (!currentUser?.uid) {
    claims.value = [];
    claimHistory.value = [];
    loading.value = false;
    return;
  }

  const claimsQuery: Query<DocumentData> = query(
    collection(db, "claims"),
    where("userId", "==", currentUser.uid),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(
    claimsQuery,
    async (snapshot) => {
      try {
        const fetchedClaims = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();

            if (!data.itemId) return null;

            const lostItemRef = doc(db, "lost_items", data.itemId);
            const lostItemSnap = await getDoc(lostItemRef);
            const lostItem: LostItem | null = lostItemSnap.exists() ? (lostItemSnap.data() as LostItem) : null;

            return {
              id: docSnap.id,
              userId: data.userId,
              itemId: data.itemId,
              itemName: lostItem?.name || "Unknown Item",
              imageUrl: lostItem?.imageUrl || "",
              status: data.status.charAt(0).toUpperCase() + data.status.slice(1),
              createdAt: data.createdAt,
            } as Claim;
          })
        );

        const validClaims = fetchedClaims.filter((claim) => claim !== null) as Claim[];

        claims.value = validClaims.filter((claim) => claim.status === "Pending");
        claimHistory.value = validClaims.filter((claim) => claim.status !== "Pending");
      } catch (error) {
        console.error("Error fetching claims:", error);
      } finally {
        loading.value = false;
      }
    },
    (error) => {
      console.error("Firestore snapshot error:", error);
      loading.value = false;
    }
  );

  return () => unsubscribe();
});

const formatDate = (timestamp: any) => {
  if (!timestamp) return "Unknown date";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusIconClass = (status: string) => {
  return status === "Pending"
    ? "i-lucide-clock text-yellow-500"
    : status === "Approved"
    ? "i-lucide-check-circle text-green-500"
    : status === "Rejected"
    ? "i-lucide-x-circle text-red-500"
    : "i-lucide-info text-gray-500";
};

const statusTextColor = (status: string) => {
  return status === "Pending"
    ? "text-yellow-500"
    : status === "Approved"
    ? "text-green-500"
    : status === "Rejected"
    ? "text-red-500"
    : "text-gray-500";
};

const cancelClaim = async (claimId: string) => {
  await deleteDoc(doc(db, "claims", claimId));
};

definePageMeta({ layout: 'user' });
</script>
