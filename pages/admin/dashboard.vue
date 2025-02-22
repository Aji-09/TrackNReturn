<script setup lang="ts">
import { useFirestore, useCollection } from "vuefire";
import { collection } from "firebase/firestore";
import { computed } from "vue";
import { useRouter } from "vue-router";

const db = useFirestore();
const router = useRouter();

// Fetch Firestore collections
const claims = useCollection(collection(db, "claims"));
const users = useCollection(collection(db, "users"));
const lostItems = useCollection(collection(db, "lost_items"));

// Compute statistics for claims
const pendingClaims = computed(() => claims.value?.filter(c => c.status === "pending").length || 0);
const approvedClaims = computed(() => claims.value?.filter(c => c.status === "approved").length || 0);
const rejectedClaims = computed(() => claims.value?.filter(c => c.status === "rejected").length || 0);

// Compute statistics for users
const totalUsers = computed(() => users.value?.length || 0);
const totalAdmins = computed(() => users.value?.filter(u => u.role === "admin").length || 0);

// Compute statistics for lost items
const totalLostItems = computed(() => lostItems.value?.length || 0);
const unclaimedLostItems = computed(() => lostItems.value?.filter(item => item.status === "unclaimed").length || 0);
const claimedLostItems = computed(() => lostItems.value?.filter(item => item.status === "claimed").length || 0);

// Navigation functions
const goToClaims = () => {
  router.push("/admin/claims");
};

const goToUsers = () => {
  router.push("/admin/users");
};

const goToLostItems = () => {
  router.push("/admin/lost-items");
};

definePageMeta({
  layout: "admin"
});
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-3xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">Admin Dashboard</h1>

    <!-- Claims Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-4 rounded-lg shadow">
        <h2 class="text-lg font-semibold text-yellow-600">Pending Claims</h2>
        <p class="text-3xl font-bold text-yellow-500">{{ pendingClaims }}</p>
      </div>
      <div class="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-4 rounded-lg shadow">
        <h2 class="text-lg font-semibold text-green-600">Approved Claims</h2>
        <p class="text-3xl font-bold text-green-500">{{ approvedClaims }}</p>
      </div>
      <div class="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-4 rounded-lg shadow">
        <h2 class="text-lg font-semibold text-red-600">Rejected Claims</h2>
        <p class="text-3xl font-bold text-red-500">{{ rejectedClaims }}</p>
      </div>
    </div>

    <!-- Manage Claims Button -->
    <div class="mt-8 text-center">
      <button
        @click="goToClaims"
        class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg"
      >
        Manage Claims
      </button>
    </div>

    <!-- User Management Section -->
    <div class="mt-12">
      <h2 class="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">User Management</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-blue-600">Total Users</h3>
          <p class="text-3xl font-bold text-blue-500">{{ totalUsers }}</p>
        </div>
        <div class="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-purple-600">Total Admins</h3>
          <p class="text-3xl font-bold text-purple-500">{{ totalAdmins }}</p>
        </div>
      </div>

      <!-- Manage Users Button -->
      <div class="mt-8 text-center">
        <button
          @click="goToUsers"
          class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg"
        >
          Manage Users
        </button>
      </div>
    </div>

    <!-- Lost Item Management Section -->
    <div class="mt-12">
      <h2 class="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">Lost Item Management</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-orange-600">Total Lost Items</h3>
          <p class="text-3xl font-bold text-orange-500">{{ totalLostItems }}</p>
        </div>
        <div class="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-600">Unclaimed Items</h3>
          <p class="text-3xl font-bold text-gray-500">{{ unclaimedLostItems }}</p>
        </div>
        <div class="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-green-600">Claimed Items</h3>
          <p class="text-3xl font-bold text-green-500">{{ claimedLostItems }}</p>
        </div>
      </div>

      <!-- Manage Lost Items Button -->
      <div class="mt-8 text-center">
        <button
          @click="goToLostItems"
          class="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow-lg"
        >
          Manage Lost Items
        </button>
      </div>
    </div>
  </div>
</template>
