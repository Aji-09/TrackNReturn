<template>
    <div class="border border-zinc-300 dark:border-zinc-700 p-4 rounded-lg shadow-md bg-white dark:bg-zinc-800">
      <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{{ claim.itemName }}</h3>
      
      <!-- Claim Status -->
      <p class="text-sm text-zinc-600 dark:text-zinc-400">
        Status: 
        <strong :class="statusTextColor(claim.status)">{{ claim.status }}</strong>
        <span :class="statusIconClass(claim.status)" class="ml-2"></span>
      </p>
  
      <!-- Item Image -->
      <div v-if="claim.imageUrl" class="mt-2">
        <img :src="claim.imageUrl" alt="Claim Image" class="w-24 h-24 object-cover rounded-md" />
      </div>
  
      <!-- Claim Date -->
      <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
        Claimed on: {{ formatDate(claim.createdAt) }}
      </p>
  
      <!-- Cancel Claim Button (Only for Pending Claims) -->
      <UButton v-if="claim.status === 'Pending'" @click="cancelClaim(claim.id)" class="mt-3">
        Cancel Claim
      </UButton>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps } from "vue";
  import { doc, deleteDoc } from "firebase/firestore";
  import { useFirestore } from "vuefire";
  
  // Firestore instance
  const db = useFirestore();
  
  // Claim Type
  interface Claim {
    id: string;
    itemName: string;
    status: string;
    imageUrl?: string;
    createdAt: any;
  }
  
  // Props
  const props = defineProps<{ claim: Claim }>();
  
  // Format timestamp
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
  
  // Determine status icon class based on claim status
  const statusIconClass = (status: string) => {
    return status === "Pending" ? "i-lucide-clock text-yellow-500" :
           status === "Approved" ? "i-lucide-check-circle text-green-500" :
           status === "Rejected" ? "i-lucide-x-circle text-red-500" : "i-lucide-info text-gray-500";
  };
  
  // Determine status text color
  const statusTextColor = (status: string) => {
    return status === "Pending" ? "text-yellow-500" :
           status === "Approved" ? "text-green-500" :
           status === "Rejected" ? "text-red-500" : "text-gray-500";
  };
  
  // Cancel claim function
  const cancelClaim = async (claimId: string) => {
    await deleteDoc(doc(db, "claims", claimId));
  };
  </script>
  