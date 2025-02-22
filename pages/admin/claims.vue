<script setup lang="ts">
import { useFirestore, useCollection } from "vuefire";
import { collection, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { computed, ref } from "vue";

const db = useFirestore();

// Define the structure of a Claim
interface Claim {
  id: string;
  userId: string;
  contactInfo: string;
  fullName: string;
  details: string;
  imageUrl: string;
  itemId: string;
  status: string;
  createdAt?: string;
}

// Define the structure of a Lost Item
interface LostItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

// Fetch claims collection from Firestore
const claims = useCollection<Claim>(collection(db, "claims"));

// Fetch lost items collection from Firestore
const lostItemsCollection = useCollection<LostItem>(collection(db, "lost_items"));

// Create a computed map of lost items for quick lookups
const lostItemsMap = computed(() => {
  const map: Record<string, LostItem> = {};
  lostItemsCollection.value?.forEach((item) => {
    map[item.id] = item;
  });
  return map;
});

// Function to update claim status
const updateClaimStatus = async (claimId: string, status: string) => {
  try {
    await updateDoc(doc(db, "claims", claimId), { status });
  } catch (error) {
    console.error("Error updating claim status:", error);
  }
};

// Function to delete a claim with confirmation
const deleteClaim = async (claimId: string) => {
  if (!confirm("Are you sure you want to delete this claim? This action cannot be undone.")) {
    return;
  }

  try {
    await deleteDoc(doc(db, "claims", claimId));

    // Remove from UI
    claims.value = claims.value?.filter((claim) => claim.id !== claimId);
  } catch (error) {
    console.error("Error deleting claim:", error);
    alert("Failed to delete claim. Please try again.");
  }
};

definePageMeta({
  layout: 'admin'
});
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8 text-center text-zinc-900 dark:text-zinc-100">
      Claims Management
    </h1>

    <ul v-if="claims?.length" class="space-y-6">
      <li
        v-for="claim in claims"
        :key="claim.id"
        class="border border-zinc-300 dark:border-zinc-700 rounded-lg shadow p-6 bg-zinc-100 dark:bg-zinc-900 flex flex-col md:flex-row items-center md:items-start gap-6"
      >
        <!-- Claim Details -->
        <div class="flex-1 w-full">
          <h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {{ claim.fullName }}'s Claim
          </h2>
          <p class="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
            <strong>Contact:</strong> {{ claim.contactInfo }}
          </p>
          <p class="text-sm text-zinc-800 dark:text-zinc-200 mt-2">
            <strong>Description from the claimant:</strong> {{ claim.details }}
          </p>
          <p
            class="text-sm font-bold px-4 py-1 mt-3 inline-block rounded-md"
            :class="{
              'bg-yellow-500 text-black': claim.status === 'pending',
              'bg-green-600 text-white': claim.status === 'approved',
              'bg-red-600 text-white': claim.status === 'rejected'
            }"
          >
            Status: {{ claim.status }}
          </p>

          <!-- Approve, Reject & Delete Buttons -->
          <div class="mt-4 flex gap-4">
            <button
              @click="updateClaimStatus(claim.id, 'approved')"
              class="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            >
              Approve
            </button>
            <button
              @click="updateClaimStatus(claim.id, 'rejected')"
              class="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
            >
              Reject
            </button>
            <button
              @click="deleteClaim(claim.id)"
              class="px-4 py-2 text-sm font-semibold bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition"
            >
              Delete
            </button>
          </div>
        </div>

        <!-- Image Section -->
        <div class="flex gap-6">
          <!-- Claimed Item Image -->
          <div class="flex flex-col items-center">
            <p class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              Claimed Item
            </p>
            <div class="w-28 h-28 flex items-center justify-center border border-zinc-400 dark:border-zinc-600 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800">
              <img
                v-if="claim.imageUrl"
                :src="claim.imageUrl"
                alt="Claimed Item Image"
                class="w-full h-full object-cover"
              />
              <p v-else class="text-sm text-red-500 text-center">No image</p>
            </div>
          </div>

          <!-- Lost Item Image -->
          <div v-if="claim.itemId" class="flex flex-col items-center">
            <p class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              Lost Item
            </p>
            <div class="w-28 h-28 flex items-center justify-center border border-zinc-400 dark:border-zinc-600 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800">
              <img
                v-if="lostItemsMap[claim.itemId]?.imageUrl"
                :src="lostItemsMap[claim.itemId].imageUrl"
                alt="Lost Item Image"
                class="w-full h-full object-cover"
              />
              <p v-else class="text-sm text-red-500 text-center">Not found</p>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <p v-else class="text-zinc-600 dark:text-zinc-400 text-center mt-6 text-lg">
      No claims found.
    </p>
  </div>
</template>
